use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{CreateRegister, DomainError, DomainResult, Register, UpdateRegister};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Register>> {
    let rows = sqlx::query_as::<_, Register>("SELECT * FROM registers ORDER BY active DESC, code")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Register> {
    sqlx::query_as::<_, Register>("SELECT * FROM registers WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Register {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Register>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Register>(
        "SELECT * FROM registers
         WHERE code LIKE ?1 OR name LIKE ?1 OR location LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateRegister) -> DomainResult<Register> {
    let register = Register::new(cmd);
    sqlx::query(
        "INSERT INTO registers (id, code, name, location, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&register.id)
    .bind(&register.code)
    .bind(&register.name)
    .bind(&register.location)
    .bind(&register.active)
    .bind(&register.created_at)
    .bind(&register.updated_at)
    .execute(pool)
    .await?;
    Ok(register)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateRegister) -> DomainResult<Register> {
    let mut register = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        register.code = v;
    }
    if let Some(v) = cmd.name {
        register.name = v;
    }
    if let Some(v) = cmd.location {
        register.location = v;
    }
    if let Some(v) = cmd.active {
        register.active = v;
    }
    register.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE registers
         SET code = ?, name = ?, location = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&register.code)
    .bind(&register.name)
    .bind(&register.location)
    .bind(&register.active)
    .bind(&register.updated_at)
    .bind(&register.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Register {}", register.id)));
    }
    Ok(register)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM registers WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Register {id}")));
    }
    Ok(())
}


