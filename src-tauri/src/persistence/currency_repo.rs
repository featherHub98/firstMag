use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{CreateCurrency, Currency, DomainError, DomainResult, UpdateCurrency};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Currency>> {
    let rows = sqlx::query_as::<_, Currency>("SELECT * FROM currencies ORDER BY active DESC, code")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Currency> {
    sqlx::query_as::<_, Currency>("SELECT * FROM currencies WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Currency {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Currency>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Currency>(
        "SELECT * FROM currencies
         WHERE code LIKE ?1 OR name LIKE ?1 OR symbol LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateCurrency) -> DomainResult<Currency> {
    let currency = Currency::new(cmd);
    sqlx::query(
        "INSERT INTO currencies (id, code, name, symbol, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&currency.id)
    .bind(&currency.code)
    .bind(&currency.name)
    .bind(&currency.symbol)
    .bind(&currency.active)
    .bind(&currency.created_at)
    .bind(&currency.updated_at)
    .execute(pool)
    .await?;
    Ok(currency)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateCurrency) -> DomainResult<Currency> {
    let mut currency = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        currency.code = v;
    }
    if let Some(v) = cmd.name {
        currency.name = v;
    }
    if let Some(v) = cmd.symbol {
        currency.symbol = v;
    }
    if let Some(v) = cmd.active {
        currency.active = v;
    }
    currency.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE currencies
         SET code = ?, name = ?, symbol = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&currency.code)
    .bind(&currency.name)
    .bind(&currency.symbol)
    .bind(&currency.active)
    .bind(&currency.updated_at)
    .bind(&currency.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Currency {}", currency.id)));
    }
    Ok(currency)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM currencies WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Currency {id}")));
    }
    Ok(())
}


