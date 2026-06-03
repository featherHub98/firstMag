#![allow(clippy::collapsible_if)]
#![allow(clippy::manual_pattern_char_comparison)]
#![allow(clippy::op_ref)]
#![allow(clippy::ptr_arg)]

use std::collections::HashSet;
use std::env;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::time::Instant;

use encoding_rs::WINDOWS_1252;

const MARKER: [u8; 8] = [0xFF; 8];

// ARTICLE.FIC field layout (offsets within a 582-byte article record):
//   [0..8]    outer marker (FF x 8)             -- skip
//   [8..58]   field 1: active flag (50 bytes)
//   [58]      NUL separator
//   [59..66]  field 2: memo ref (7 bytes)       -- skip
//   [66]      NUL separator
//   [67..74]  inner marker (FF x 7)             -- skip
//   [74..94]  field 3: code (20 bytes)          -- ARTICLE.Darti
//   [94]      NUL separator
//   [95..155] field 4: designation (60 bytes)   -- ARTICLE.Designation
//   [155]     NUL separator
//   [156..164] field 5: PA purchase price (8B double)  -- ARTICLE.PA
//   [164..168] 4 NULs (double separator)
//   [168..176] field 6: PV sale price (8B double)     -- ARTICLE.PV
//   [176..180] 4 NULs (double separator)
//   [180..]   rest (stock fields, tax, etc.)
//
// A 1044-byte block = 462-byte memo + 582-byte article.  We extract the
// article from the second 462..1043 region.  All other sizes are skipped.

const F_CODE_START: usize = 74;
const F_CODE_END: usize = 94;
const F_NAME_START: usize = 95;
const F_NAME_END: usize = 155;
const F_PA_START: usize = 156;
const F_PA_END: usize = 164;
const F_PV_START: usize = 168;
const F_PV_END: usize = 176;
const ARTICLE_SIZE: usize = 582;
const MEMO_PLUS_ARTICLE: usize = 1044;
const MEMO_OFFSET: usize = 462;

fn find_markers(data: &[u8]) -> Vec<usize> {
    let mut positions = Vec::new();
    if data.len() < 8 {
        return positions;
    }
    let mut i = 0;
    while i + 8 <= data.len() {
        if &data[i..i + 8] == &MARKER {
            positions.push(i);
            i += 8;
        } else {
            i += 1;
        }
    }
    positions
}

fn decode_cp1252(bytes: &[u8]) -> String {
    let (cow, _, _) = WINDOWS_1252.decode(bytes);
    cow.into_owned()
}

fn trim_field(s: &str) -> String {
    s.trim_end_matches(|c: char| c == '\0' || c == ' ')
        .to_string()
}

fn try_parse_article(block: &[u8], article_offset: usize) -> Option<(String, String, f64, f64)> {
    let end = article_offset + ARTICLE_SIZE;
    if block.len() < end {
        return None;
    }
    let code_start = article_offset + F_CODE_START;
    let code_end = article_offset + F_CODE_END;
    let name_start = article_offset + F_NAME_START;
    let name_end = article_offset + F_NAME_END;
    let pa_start = article_offset + F_PA_START;
    let pa_end = article_offset + F_PA_END;
    let pv_start = article_offset + F_PV_START;
    let pv_end = article_offset + F_PV_END;
    let code = trim_field(&decode_cp1252(&block[code_start..code_end]));
    if code.is_empty() {
        return None;
    }
    let name = trim_field(&decode_cp1252(&block[name_start..name_end]));
    let pa_bytes: [u8; 8] = block[pa_start..pa_end].try_into().ok()?;
    let pv_bytes: [u8; 8] = block[pv_start..pv_end].try_into().ok()?;
    let pa = f64::from_le_bytes(pa_bytes);
    let pv = f64::from_le_bytes(pv_bytes);
    Some((code, name, pa, pv))
}

fn fmt_price(v: f64) -> String {
    if !v.is_finite() {
        String::new()
    } else {
        format!("{:.2}", v)
    }
}

fn extract_articles(fic_path: &PathBuf, csv_path: &PathBuf) -> std::io::Result<usize> {
    let started = Instant::now();
    let data = fs::read(fic_path)?;
    let markers = find_markers(&data);

    let mut csv = fs::File::create(csv_path)?;
    let mut seen: HashSet<String> = HashSet::new();
    let mut count = 0usize;
    let mut skipped = 0usize;

    for w in markers.windows(2) {
        let size = w[1] - w[0];
        let article_off = match size {
            ARTICLE_SIZE => 0,
            MEMO_PLUS_ARTICLE => MEMO_OFFSET,
            _ => {
                skipped += 1;
                continue;
            }
        };
        let block = &data[w[0]..w[1]];
        if let Some((code, name, pa, pv)) = try_parse_article(block, article_off) {
            if seen.insert(code.clone()) {
                writeln!(
                    csv,
                    "{};{};;{};{};U",
                    code,
                    name,
                    fmt_price(pa),
                    fmt_price(pv)
                )?;
                count += 1;
            }
        }
    }

    eprintln!(
        "  markers={} articles={} skipped={} elapsed={:?}",
        markers.len(),
        count,
        skipped,
        started.elapsed()
    );
    Ok(count)
}

// CLIENT.FIC uses 11-byte FF markers (FF x 11). Record layout (body after marker):
//   body[0..20]    code (20B, space-padded)
//   body[20]       NUL
//   body[21..81]   name (60B, space-padded)
//   body[81]       NUL
//   body[82..122]  address (40B, space-padded)
//   body[122]      NUL
//   body[123..153] phone/ref (30B, often "0" + spaces or phone number)
//   body[153..158] NUL padding (5B)
//   body[158..178] tax_id / mat_fiscal (20B)
//   body[178+]     NUL padding
const CLIENT_MARKER_LEN: usize = 11;

fn find_markers_len(data: &[u8], marker_len: usize) -> Vec<usize> {
    let mut positions = Vec::new();
    if data.len() < marker_len {
        return positions;
    }
    let mut i = 0;
    while i + marker_len <= data.len() {
        let mut match_all = true;
        for j in 0..marker_len {
            if data[i + j] != 0xFF {
                match_all = false;
                break;
            }
        }
        if match_all {
            positions.push(i);
            i += marker_len;
        } else {
            i += 1;
        }
    }
    positions
}

fn extract_clients(fic_path: &PathBuf, csv_path: &PathBuf) -> std::io::Result<usize> {
    let data = fs::read(fic_path)?;
    let markers = find_markers_len(&data, CLIENT_MARKER_LEN);
    let mut csv = fs::File::create(csv_path)?;
    let mut seen = HashSet::new();
    let mut count = 0usize;

    for w in markers.windows(2).skip(1) {
        let body = &data[w[0] + CLIENT_MARKER_LEN..w[1]];
        if body.len() < 180 {
            continue;
        }
        let code = trim_field(&decode_cp1252(&body[0..20]));
        if code.is_empty() || seen.contains(&code) {
            continue;
        }
        let name = trim_field(&decode_cp1252(&body[21..81]));
        let address = trim_field(&decode_cp1252(&body[82..122]));
        let phone = trim_field(&decode_cp1252(&body[123..153]));
        let tax_id = trim_field(&decode_cp1252(&body[158..178]));
        seen.insert(code.clone());
        writeln!(csv, "{};{};{};{};{}", code, name, address, phone, tax_id)?;
        count += 1;
    }
    eprintln!("  clients: {count}");
    Ok(count)
}

fn extract_plu_barcodes(fic_dir: &PathBuf, csv_path: &PathBuf) -> std::io::Result<usize> {
    let plu_paths = vec![
        fic_dir.join("PLU.TXT"),
        PathBuf::from(r"D:\hamma\FIRSTMAG\PLU.TXT"),
    ];
    let mut csv = fs::File::create(csv_path)?;
    let mut seen = HashSet::new();
    let mut count = 0usize;

    for plu_path in &plu_paths {
        if !plu_path.exists() {
            continue;
        }
        if let Ok(plu_data) = fs::read_to_string(plu_path) {
            for line in plu_data.lines() {
                let parts: Vec<&str> = line.split(';').collect();
                if parts.len() >= 2 {
                    let code = parts[0].trim();
                    let barcode = parts[1].trim();
                    if !code.is_empty() && !barcode.is_empty() && barcode.len() >= 8 {
                        if seen.insert(code.to_string()) {
                            writeln!(csv, "{};{}", code, barcode)?;
                            count += 1;
                        }
                    }
                }
            }
        }
    }
    Ok(count)
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: hfsql-extract <input_fic_dir> <output_csv_dir>");
        eprintln!("Extracts ARTICLE.FIC -> ARTICLE.csv, CODEABARRE.FIC -> CODEABARRE.csv");
        eprintln!("Also reads PLU.TXT for extra barcode mappings.");
        std::process::exit(1);
    }
    let fic_dir = PathBuf::from(&args[1]);
    let csv_dir = PathBuf::from(&args[2]);
    fs::create_dir_all(&csv_dir).ok();

    // First extract ARTICLE.FIC
    let article_fic = fic_dir.join("ARTICLE.FIC");
    if !article_fic.exists() {
        eprintln!("ARTICLE.FIC not found in {}", fic_dir.display());
        std::process::exit(2);
    }
    let article_csv = csv_dir.join("ARTICLE.csv");
    let _n_art = match extract_articles(&article_fic, &article_csv) {
        Ok(n) => {
            println!("ARTICLE.FIC: {n} records -> {}", article_csv.display());
            n
        }
        Err(e) => {
            eprintln!("ARTICLE.FIC: error: {e}");
            0
        }
    };

    // Extract CLIENT.FIC
    let client_fic = fic_dir.join("CLIENT.FIC");
    if client_fic.exists() {
        let client_csv = csv_dir.join("CLIENT.csv");
        match extract_clients(&client_fic, &client_csv) {
            Ok(n) => println!("CLIENT.FIC: {n} records -> {}", client_csv.display()),
            Err(e) => eprintln!("CLIENT.FIC: error: {e}"),
        }
    }

    // Extract CODEABARRE.csv from PLU.TXT / OLYMPIAPLU.TXT
    let codeabarre_csv = csv_dir.join("CODEABARRE.csv");
    match extract_plu_barcodes(&fic_dir, &codeabarre_csv) {
        Ok(n) => println!(
            "PLU.TXT: {n} barcode mappings -> {}",
            codeabarre_csv.display()
        ),
        Err(e) => eprintln!("PLU.TXT: error: {e}"),
    }
}
