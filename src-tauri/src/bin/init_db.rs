#![allow(clippy::needless_borrows_for_generic_args)]

use sqlx::SqlitePool;
use std::env;
use std::fs;

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: init_db <db_path>");
        std::process::exit(1);
    }
    let db = &args[1];
    if fs::metadata(db).is_ok() {
        fs::remove_file(db).ok();
    }
    if let Some(parent) = std::path::Path::new(db).parent() {
        fs::create_dir_all(parent).ok();
    }

    let pool = SqlitePool::connect(&format!("sqlite://{db}?mode=rwc"))
        .await
        .expect("connect");

    for mig in [
        include_str!("../persistence/migrations/001_initial.sql"),
        include_str!("../persistence/migrations/002_references.sql"),
    ] {
        // SQLite driver does not support multiple statements per query, so split on `;` at end of line
        for stmt in mig.split(';') {
            let s = stmt.trim();
            if s.is_empty() || s.starts_with("--") {
                continue;
            }
            sqlx::query(s).execute(&pool).await.expect("migrate");
        }
    }

    // Seed default tax rates
    for (id, name, rate) in [
        ("tax-1", "TVA 19.6%", 19600u64),
        ("tax-2", "TVA 10%", 10000u64),
        ("tax-3", "TVA 21%", 21000u64),
        ("tax-0", "Exonéré", 0u64),
    ] {
        sqlx::query("INSERT OR IGNORE INTO tax_rates (id, name, rate) VALUES (?, ?, ?)")
            .bind(&id)
            .bind(&name)
            .bind(rate as i64)
            .execute(&pool)
            .await
            .ok();
    }
    println!("Initialized {db}");
}

