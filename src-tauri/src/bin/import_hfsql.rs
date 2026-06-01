use std::path::PathBuf;
use std::fs::File;
use std::io::BufReader;
use csv::ReaderBuilder;
use encoding_rs::WINDOWS_1252;
use sqlx::SqlitePool;
use uuid::Uuid;
use chrono::Utc;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: import-hfsql <db_path> <csv_dir>");
        eprintln!("Imports: ARTICLE.csv, CLIENT.csv, CODEABARRE.csv, ENTETE.csv, LIGNE.csv");
        std::process::exit(1);
    }

    let db_path = &args[1];
    let dir = PathBuf::from(&args[2]);

    let pool = SqlitePool::connect(db_path).await.expect("DB connect");
    sqlx::query("PRAGMA foreign_keys = OFF").execute(&pool).await.ok();

    let mut total = 0u64;

    if let Ok(n) = import_articles(&pool, &dir).await { total += n; }
    if let Ok(n) = import_partners(&pool, &dir).await { total += n; }
    if let Ok(n) = import_barcodes(&pool, &dir).await { total += n; }
    if let Ok(n) = import_documents(&pool, &dir).await { total += n; }

    sqlx::query("PRAGMA foreign_keys = ON").execute(&pool).await.ok();
    println!("Import terminé: {total} enregistrements");
}

fn cp1252_to_utf8(bytes: &[u8]) -> String {
    let (cow, _) = WINDOWS_1252.decode_without_bom_handling(bytes);
    cow.into_owned()
}

fn read_csv(path: &PathBuf) -> Result<Vec<Vec<String>>, String> {
    let file = File::open(path).map_err(|e| format!("{path:?}: {e}"))?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .has_headers(false)
        .flexible(true)
        .from_reader(BufReader::new(file));

    let mut rows = Vec::new();
    for result in rdr.records() {
        let rec = result.map_err(|e| format!("CSV error: {e}"))?;
        let row: Vec<String> = rec.iter().map(|f| cp1252_to_utf8(f.as_bytes())).collect();
        rows.push(row);
    }
    Ok(rows)
}

fn get(rec: &[String], i: usize) -> &str {
    rec.get(i).map(|s| s.trim()).unwrap_or("")
}

fn parse_i64(s: &str) -> i64 {
    s.trim().replace(',', ".").replace(' ', "").parse().unwrap_or(0)
}

fn parse_price_millimes(s: &str) -> i64 {
    let cleaned = s.trim().replace(',', ".").replace(' ', "");
    let dinars: f64 = cleaned.parse().unwrap_or(0.0);
    if !dinars.is_finite() || dinars < 0.0 {
        0
    } else {
        (dinars * 1000.0).round() as i64
    }
}

async fn import_articles(pool: &SqlitePool, dir: &PathBuf) -> Result<u64, String> {
    let path = dir.join("ARTICLE.csv");
    if !path.exists() { return Ok(0); }
    let rows = read_csv(&path)?;
    let mut n = 0u64;
    let now = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();

    for rec in &rows {
        if get(rec, 0).is_empty() { continue; }
        let code = get(rec, 0);
        let name = get(rec, 1);
        let barcode = get(rec, 2);
        let purchase_price = parse_price_millimes(get(rec, 3));
        let sale_price = parse_price_millimes(get(rec, 4));
        let unit = get(rec, 5);
        let id = Uuid::new_v4().to_string();

        let r = sqlx::query(
            "INSERT OR IGNORE INTO articles (id, code, barcode, name, purchase_price, sale_price, unit, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)"
        )
        .bind(&id).bind(code).bind(barcode).bind(name)
        .bind(purchase_price).bind(sale_price).bind(unit)
        .bind(&now).bind(&now)
        .execute(pool).await.map_err(|e| format!("Article insert: {e}"))?;

        n += r.rows_affected();
    }
    println!("  Articles: {n} lignes importées");
    Ok(n)
}

async fn import_partners(pool: &SqlitePool, dir: &PathBuf) -> Result<u64, String> {
    let path = dir.join("CLIENT.csv");
    if !path.exists() { return Ok(0); }
    let rows = read_csv(&path)?;
    let mut n = 0u64;
    let now = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();

    for rec in &rows {
        let code = get(rec, 0);
        if code.is_empty() { continue; }
        let name = get(rec, 1);
        let address = get(rec, 2);
        let phone = get(rec, 3);
        let tax_id = get(rec, 4);
        let id = Uuid::new_v4().to_string();

        let r = sqlx::query(
            "INSERT OR IGNORE INTO partners (id, partner_type, code, name, address, phone, tax_id, active, created_at, updated_at)
             VALUES (?, 'client', ?, ?, ?, ?, ?, 1, ?, ?)"
        )
        .bind(&id).bind(code).bind(name).bind(address).bind(phone).bind(tax_id)
        .bind(&now).bind(&now)
        .execute(pool).await.map_err(|e| format!("Partner insert: {e}"))?;

        n += r.rows_affected();
    }
    println!("  Clients: {n} lignes importées");
    Ok(n)
}

async fn import_barcodes(pool: &SqlitePool, dir: &PathBuf) -> Result<u64, String> {
    let path = dir.join("CODEABARRE.csv");
    if !path.exists() { return Ok(0); }
    let rows = read_csv(&path)?;
    let mut n = 0u64;

    for rec in &rows {
        let code = get(rec, 0);
        let barcode = get(rec, 1);
        if code.is_empty() || barcode.is_empty() { continue; }

        let r = sqlx::query("UPDATE articles SET barcode = ? WHERE code = ? AND barcode = ''")
            .bind(barcode).bind(code)
            .execute(pool).await.map_err(|e| format!("Barcode update: {e}"))?;

        n += r.rows_affected();
    }
    println!("  CODEABARRE: {n} lignes importées");
    Ok(n)
}

async fn import_documents(pool: &SqlitePool, dir: &PathBuf) -> Result<u64, String> {
    let entete_path = dir.join("ENTETE.csv");
    let ligne_path = dir.join("LIGNE.csv");
    if !entete_path.exists() || !ligne_path.exists() { return Ok(0); }

    let headers = read_csv(&entete_path)?;
    let lines = read_csv(&ligne_path)?;

    let mut doc_map: std::collections::HashMap<String, String> = std::collections::HashMap::new();
    let mut n = 0u64;

    for rec in &headers {
        let num = get(rec, 0);
        if num.is_empty() { continue; }
        let partner_code = get(rec, 1);
        let total_ht = parse_price_millimes(get(rec, 2));
        let total_tax = parse_price_millimes(get(rec, 3));
        let total_ttc = parse_price_millimes(get(rec, 4));
        let date_str = get(rec, 5);
        let doc_id = Uuid::new_v4().to_string();
        let now = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
        let dt = if date_str.is_empty() { &now } else { date_str };

        sqlx::query(
            "INSERT OR IGNORE INTO documents
             (id, doc_type, doc_number, status, partner_id, partner_name, total_ht, total_tax, total_ttc, notes, created_at, updated_at)
             VALUES (?, 'invoice', ?, 'confirmed', ?, '', ?, ?, ?, '', ?, ?)"
        )
        .bind(&doc_id).bind(num).bind(partner_code)
        .bind(total_ht).bind(total_tax).bind(total_ttc)
        .bind(dt).bind(dt)
        .execute(pool).await.map_err(|e| format!("Doc insert: {e}"))?;

        doc_map.insert(num.to_string(), doc_id);
        n += 1;
    }

    for rec in &lines {
        let num = get(rec, 0);
        let article_code = get(rec, 1);
        let qty = parse_i64(get(rec, 2)).max(0);
        let price = parse_price_millimes(get(rec, 3));
        let doc_id = match doc_map.get(num) {
            Some(id) => id.clone(),
            None => continue,
        };
        let line_id = Uuid::new_v4().to_string();
        let total_ht = qty * price;
        let total_ttc = total_ht;

        sqlx::query(
            "INSERT INTO document_lines (id, document_id, article_id, article_name, quantity, unit_price, tax_rate, total_ht, total_ttc)
             VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)"
        )
        .bind(&line_id).bind(&doc_id).bind(article_code).bind("")
        .bind(qty).bind(price)
        .bind(total_ht).bind(total_ttc)
        .execute(pool).await.map_err(|e| format!("Line insert: {e}"))?;
    }

    println!("  Documents: {n} entêtes importées");
    Ok(n)
}
