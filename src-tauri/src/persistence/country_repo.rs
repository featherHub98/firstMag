use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{Country, CreateCountry, DomainError, DomainResult, UpdateCountry};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Country>> {
    let rows = sqlx::query_as::<_, Country>("SELECT * FROM countries ORDER BY active DESC, name")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Country> {
    sqlx::query_as::<_, Country>("SELECT * FROM countries WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Country {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Country>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Country>(
        "SELECT * FROM countries
         WHERE code LIKE ?1 OR name LIKE ?1 OR iso2 LIKE ?1
         ORDER BY active DESC, name
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateCountry) -> DomainResult<Country> {
    let row = Country::new(cmd);
    sqlx::query(
        "INSERT INTO countries (id, code, name, iso2, phone_code, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&row.id)
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.iso2)
    .bind(&row.phone_code)
    .bind(&row.active)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool)
    .await?;
    Ok(row)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateCountry) -> DomainResult<Country> {
    let mut row = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code { row.code = v; }
    if let Some(v) = cmd.name { row.name = v; }
    if let Some(v) = cmd.iso2 { row.iso2 = v; }
    if let Some(v) = cmd.phone_code { row.phone_code = v; }
    if let Some(v) = cmd.active { row.active = v; }
    row.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE countries
         SET code = ?, name = ?, iso2 = ?, phone_code = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.iso2)
    .bind(&row.phone_code)
    .bind(&row.active)
    .bind(&row.updated_at)
    .bind(&row.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Country {}", row.id)));
    }
    Ok(row)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM countries WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Country {id}")));
    }
    Ok(())
}


