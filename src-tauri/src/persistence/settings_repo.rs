use std::collections::HashMap;

use sqlx::SqlitePool;

use crate::domain::{DocumentSeries, DomainResult};

pub async fn get_app_settings(
    pool: &SqlitePool,
    keys: &[String],
) -> DomainResult<HashMap<String, String>> {
    if keys.is_empty() {
        return Ok(HashMap::new());
    }

    let mut out = HashMap::new();
    for key in keys {
        let value = sqlx::query_scalar::<_, String>("SELECT value FROM app_settings WHERE key = ?")
            .bind(&key)
            .fetch_optional(pool)
            .await?
            .unwrap_or_default();
        out.insert(key.clone(), value);
    }
    Ok(out)
}

pub async fn set_app_settings(
    pool: &SqlitePool,
    entries: &HashMap<String, String>,
) -> DomainResult<()> {
    let mut tx = pool.begin().await?;
    for (key, value) in entries {
        sqlx::query(
            "INSERT INTO app_settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        )
        .bind(&key)
        .bind(&value)
        .execute(&mut *tx)
        .await?;
    }
    tx.commit().await?;
    Ok(())
}

pub async fn list_document_series(pool: &SqlitePool) -> DomainResult<Vec<DocumentSeries>> {
    let rows = sqlx::query_as::<_, DocumentSeries>(
        "SELECT id, doc_type, prefix, next_number, format
         FROM document_series
         ORDER BY doc_type",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn update_document_series(
    pool: &SqlitePool,
    id: &str,
    prefix: &str,
    next_number: i64,
    format: &str,
) -> DomainResult<()> {
    sqlx::query(
        "UPDATE document_series
         SET prefix = ?, next_number = ?, format = ?
         WHERE id = ?",
    )
    .bind(&prefix)
    .bind(&next_number)
    .bind(&format)
    .bind(&id)
    .execute(pool)
    .await?;
    Ok(())
}

