use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use uuid::Uuid;

use crate::AppState;

#[derive(Debug, Serialize)]
pub struct BackupResult {
    pub path: String,
    pub bytes: u64,
}

#[derive(Debug, Serialize)]
pub struct RestoreResult {
    pub source_path: String,
    pub copied_tables: i64,
}

#[derive(Debug, Serialize)]
pub struct DbHealthResult {
    pub quick_check: String,
    pub integrity_check: String,
    pub ok: bool,
}

#[derive(Debug, Deserialize)]
pub struct FiscalPluItem {
    pub article_code: String,
    pub label: String,
    pub price: i64,
    pub barcode: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UploadPluCmd {
    pub source: String,
    pub items: Vec<FiscalPluItem>,
}

#[derive(Debug, Serialize)]
pub struct UploadPluResult {
    pub accepted_count: i64,
    pub source: String,
    pub uploaded_at: String,
}

#[derive(Debug, Deserialize)]
pub struct ExternalImportCsvCmd {
    pub path: String,
    pub strategy: String, // upsert | insert_only | update_only
}

#[derive(Debug, Serialize)]
pub struct ExternalImportCsvResult {
    pub inserted: i64,
    pub updated: i64,
    pub skipped: i64,
    pub failed: i64,
}

#[derive(Debug, Serialize)]
pub struct SyncRunResult {
    pub endpoint: String,
    pub started_at: String,
    pub status: String,
}

#[tauri::command]
pub async fn backup_database(
    state: tauri::State<'_, AppState>,
    target_path: String,
) -> Result<BackupResult, String> {
    let bytes = fs::copy(&state.db_path, &target_path)
        .map_err(|e| format!("Backup copy failed: {e}"))?;
    Ok(BackupResult {
        path: target_path,
        bytes,
    })
}

#[tauri::command]
pub async fn restore_database_from_backup(
    state: tauri::State<'_, AppState>,
    source_path: String,
) -> Result<RestoreResult, String> {
    let mut conn = state.db.acquire().await.map_err(|e| e.to_string())?;
    sqlx::query("ATTACH DATABASE ? AS src")
        .bind(&source_path)
        .execute(&mut *conn)
        .await
        .map_err(|e| format!("Attach source DB failed: {e}"))?;

    let src_tables: Vec<String> =
        sqlx::query_scalar("SELECT name FROM src.sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
            .fetch_all(&mut *conn)
            .await
            .map_err(|e| e.to_string())?;
    let main_tables: HashSet<String> =
        sqlx::query_scalar("SELECT name FROM main.sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
            .fetch_all(&mut *conn)
            .await
            .map_err(|e| e.to_string())?
            .into_iter()
            .collect();

    sqlx::query("PRAGMA foreign_keys = OFF")
        .execute(&mut *conn)
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query("BEGIN IMMEDIATE TRANSACTION")
        .execute(&mut *conn)
        .await
        .map_err(|e| e.to_string())?;

    let mut copied_tables = 0_i64;
    for table in src_tables {
        if !main_tables.contains(&table) {
            continue;
        }
        let delete_sql = format!("DELETE FROM \"{table}\"");
        sqlx::query(&delete_sql)
            .execute(&mut *conn)
            .await
            .map_err(|e| format!("Delete failed for {table}: {e}"))?;
        let insert_sql = format!("INSERT INTO \"{table}\" SELECT * FROM src.\"{table}\"");
        sqlx::query(&insert_sql)
            .execute(&mut *conn)
            .await
            .map_err(|e| format!("Insert failed for {table}: {e}"))?;
        copied_tables += 1;
    }

    sqlx::query("COMMIT")
        .execute(&mut *conn)
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query("PRAGMA foreign_keys = ON")
        .execute(&mut *conn)
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query("DETACH DATABASE src")
        .execute(&mut *conn)
        .await
        .map_err(|e| e.to_string())?;

    Ok(RestoreResult {
        source_path,
        copied_tables,
    })
}

#[tauri::command]
pub async fn verify_database_health(
    state: tauri::State<'_, AppState>,
) -> Result<DbHealthResult, String> {
    let quick_check: String = sqlx::query_scalar("PRAGMA quick_check")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    let integrity_check: String = sqlx::query_scalar("PRAGMA integrity_check")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    let ok = quick_check.eq_ignore_ascii_case("ok") && integrity_check.eq_ignore_ascii_case("ok");
    Ok(DbHealthResult {
        quick_check,
        integrity_check,
        ok,
    })
}

#[tauri::command]
pub async fn upload_fiscal_plu(
    state: tauri::State<'_, AppState>,
    cmd: UploadPluCmd,
) -> Result<UploadPluResult, String> {
    let accepted_count = cmd
        .items
        .iter()
        .filter(|i| !i.article_code.trim().is_empty() && i.price >= 0)
        .count() as i64;
    let uploaded_at = Utc::now().to_rfc3339();
    let mut entries = HashMap::new();
    entries.insert("fiscal_plu_source".to_string(), cmd.source.clone());
    entries.insert(
        "fiscal_plu_last_count".to_string(),
        accepted_count.to_string(),
    );
    entries.insert("fiscal_plu_last_at".to_string(), uploaded_at.clone());

    for (k, v) in entries {
        sqlx::query(
            "INSERT INTO app_settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        )
        .bind(&k)
        .bind(&v)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(UploadPluResult {
        accepted_count,
        source: cmd.source,
        uploaded_at,
    })
}

#[tauri::command]
pub async fn import_external_register_csv(
    state: tauri::State<'_, AppState>,
    cmd: ExternalImportCsvCmd,
) -> Result<ExternalImportCsvResult, String> {
    let mut reader = csv::Reader::from_path(&cmd.path)
        .map_err(|e| format!("Cannot open CSV {}: {e}", cmd.path))?;

    let mut inserted = 0_i64;
    let mut updated = 0_i64;
    let mut skipped = 0_i64;
    let mut failed = 0_i64;
    let now = Utc::now();

    for rec in reader.deserialize::<HashMap<String, String>>() {
        let row = match rec {
            Ok(r) => r,
            Err(_) => {
                failed += 1;
                continue;
            }
        };

        let code = row.get("code").cloned().unwrap_or_default();
        let name = row.get("name").cloned().unwrap_or_default();
        if code.trim().is_empty() || name.trim().is_empty() {
            skipped += 1;
            continue;
        }
        let barcode = row.get("barcode").cloned().unwrap_or_default();
        let purchase_price = row
            .get("purchase_price")
            .and_then(|v| v.parse::<f64>().ok())
            .map(|v| (v * 1000.0).round() as i64)
            .unwrap_or(0);
        let sale_price = row
            .get("sale_price")
            .and_then(|v| v.parse::<f64>().ok())
            .map(|v| (v * 1000.0).round() as i64)
            .unwrap_or(0);
        let unit = row
            .get("unit")
            .cloned()
            .filter(|u| !u.trim().is_empty())
            .unwrap_or_else(|| "pcs".to_string());

        let existing_id: Option<String> = sqlx::query_scalar("SELECT id FROM articles WHERE code = ?")
            .bind(&code)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?;

        match (existing_id, cmd.strategy.as_str()) {
            (Some(_), "insert_only") => {
                skipped += 1;
            }
            (None, "update_only") => {
                skipped += 1;
            }
            (Some(id), _) => {
                sqlx::query(
                    "UPDATE articles
                     SET name = ?, barcode = ?, purchase_price = ?, sale_price = ?, unit = ?, updated_at = ?
                     WHERE id = ?",
                )
                .bind(&name)
                .bind(&barcode)
                .bind(&purchase_price)
                .bind(&sale_price)
                .bind(&unit)
                .bind(&now)
                .bind(&id)
                .execute(&state.db)
                .await
                .map_err(|e| e.to_string())?;
                updated += 1;
            }
            (None, _) => {
                sqlx::query(
                    "INSERT INTO articles
                     (id, code, barcode, name, family_id, sub_family_id, purchase_price, sale_price, tax_rate_id, unit, active, created_at, updated_at)
                     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, NULL, ?, 1, ?, ?)",
                )
                .bind(&Uuid::new_v4().to_string())
                .bind(&code)
                .bind(&barcode)
                .bind(&name)
                .bind(&purchase_price)
                .bind(&sale_price)
                .bind(&unit)
                .bind(&now)
                .bind(&now)
                .execute(&state.db)
                .await
                .map_err(|e| e.to_string())?;
                inserted += 1;
            }
        }
    }

    Ok(ExternalImportCsvResult {
        inserted,
        updated,
        skipped,
        failed,
    })
}

#[tauri::command]
pub async fn run_site_sync_now(
    state: tauri::State<'_, AppState>,
    endpoint: String,
) -> Result<SyncRunResult, String> {
    let started_at = Utc::now().to_rfc3339();
    sqlx::query(
        "INSERT INTO app_settings (key, value) VALUES ('sync_last_run_at', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(&started_at)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    sqlx::query(
        "INSERT INTO app_settings (key, value) VALUES ('sync_last_endpoint', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(&endpoint)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(SyncRunResult {
        endpoint,
        started_at,
        status: "ok".to_string(),
    })
}


