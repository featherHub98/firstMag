use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{Cashier, CreateCashier, DomainError, DomainResult, UpdateCashier};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Cashier>> {
    let rows = sqlx::query_as::<_, Cashier>("SELECT * FROM cashiers ORDER BY active DESC, code")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Cashier> {
    sqlx::query_as::<_, Cashier>("SELECT * FROM cashiers WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Cashier {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Cashier>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Cashier>(
        "SELECT * FROM cashiers
         WHERE code LIKE ?1 OR name LIKE ?1 OR phone LIKE ?1 OR email LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateCashier) -> DomainResult<Cashier> {
    let cashier = Cashier::new(cmd);
    sqlx::query(
        "INSERT INTO cashiers (id, code, name, email, phone, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&cashier.id)
    .bind(&cashier.code)
    .bind(&cashier.name)
    .bind(&cashier.email)
    .bind(&cashier.phone)
    .bind(&cashier.active)
    .bind(&cashier.created_at)
    .bind(&cashier.updated_at)
    .execute(pool)
    .await?;
    Ok(cashier)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateCashier) -> DomainResult<Cashier> {
    let mut cashier = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        cashier.code = v;
    }
    if let Some(v) = cmd.name {
        cashier.name = v;
    }
    if let Some(v) = cmd.email {
        cashier.email = v;
    }
    if let Some(v) = cmd.phone {
        cashier.phone = v;
    }
    if let Some(v) = cmd.active {
        cashier.active = v;
    }
    cashier.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE cashiers
         SET code = ?, name = ?, email = ?, phone = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&cashier.code)
    .bind(&cashier.name)
    .bind(&cashier.email)
    .bind(&cashier.phone)
    .bind(&cashier.active)
    .bind(&cashier.updated_at)
    .bind(&cashier.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Cashier {}", cashier.id)));
    }
    Ok(cashier)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM cashiers WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Cashier {id}")));
    }
    Ok(())
}


