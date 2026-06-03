use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{Bank, CreateBank, DomainError, DomainResult, UpdateBank};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Bank>> {
    let rows = sqlx::query_as::<_, Bank>("SELECT * FROM banks ORDER BY active DESC, code")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Bank> {
    sqlx::query_as::<_, Bank>("SELECT * FROM banks WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Bank {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Bank>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Bank>(
        "SELECT * FROM banks
         WHERE code LIKE ?1 OR name LIKE ?1 OR address LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateBank) -> DomainResult<Bank> {
    let bank = Bank::new(cmd);
    sqlx::query(
        "INSERT INTO banks (id, code, name, address, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&bank.id)
    .bind(&bank.code)
    .bind(&bank.name)
    .bind(&bank.address)
    .bind(&bank.active)
    .bind(&bank.created_at)
    .bind(&bank.updated_at)
    .execute(pool)
    .await?;
    Ok(bank)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateBank) -> DomainResult<Bank> {
    let mut bank = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        bank.code = v;
    }
    if let Some(v) = cmd.name {
        bank.name = v;
    }
    if let Some(v) = cmd.address {
        bank.address = v;
    }
    if let Some(v) = cmd.active {
        bank.active = v;
    }
    bank.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE banks
         SET code = ?, name = ?, address = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&bank.code)
    .bind(&bank.name)
    .bind(&bank.address)
    .bind(&bank.active)
    .bind(&bank.updated_at)
    .bind(&bank.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Bank {}", bank.id)));
    }
    Ok(bank)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM banks WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Bank {id}")));
    }
    Ok(())
}


