use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: import_pipeline <db_path> [hfsql_dir]");
        eprintln!("  hfsql_dir defaults to C:\\ProgramData\\FIRSTMAG");
        std::process::exit(1);
    }
    let db = &args[1];
    let hfsql_dir = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| "C:\\ProgramData\\FIRSTMAG".to_string());
    let work_dir = env::temp_dir().join("firstmag_import");
    fs::create_dir_all(&work_dir).ok();
    let bin_dir = env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|x| x.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));

    let init = bin_dir.join(if cfg!(windows) {
        "init_db.exe"
    } else {
        "init_db"
    });
    let extract = bin_dir.join(if cfg!(windows) {
        "hfsql_extract.exe"
    } else {
        "hfsql_extract"
    });
    let import = bin_dir.join(if cfg!(windows) {
        "import_hfsql.exe"
    } else {
        "import_hfsql"
    });

    let run = |exe: &PathBuf, a: &[&str]| -> bool {
        let out = Command::new(exe).args(a).output();
        match out {
            Ok(o) => {
                print!("{}", String::from_utf8_lossy(&o.stdout));
                eprint!("{}", String::from_utf8_lossy(&o.stderr));
                o.status.success()
            }
            Err(e) => {
                eprintln!("failed to launch {}: {e}", exe.display());
                false
            }
        }
    };

    if !run(&init, &[db]) {
        std::process::exit(2);
    }
    if !run(&extract, &[&hfsql_dir, work_dir.to_str().unwrap()]) {
        std::process::exit(3);
    }
    if !run(&import, &[db, work_dir.to_str().unwrap()]) {
        std::process::exit(4);
    }
    println!("Pipeline complete -> {db}");
}
