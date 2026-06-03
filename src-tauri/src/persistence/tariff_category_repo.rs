use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{
    CreateTariffCategory, DomainError, DomainResult, TariffCategory, UpdateTariffCategory,
};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<TariffCategory>> {
    let rows = sqlx::query_as::<_, TariffCategory>(
        "SELECT * FROM tariff_categories ORDER BY active DESC, code",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<TariffCategory> {
    sqlx::query_as::<_, TariffCategory>("SELECT * FROM tariff_categories WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Tariff category {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<TariffCategory>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, TariffCategory>(
        "SELECT * FROM tariff_categories
         WHERE code LIKE ?1 OR name LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateTariffCategory) -> DomainResult<TariffCategory> {
    let row = TariffCategory::new(cmd);
    sqlx::query(
        "INSERT INTO tariff_categories (id, code, name, discount_rate, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&row.id)
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.discount_rate)
    .bind(&row.active)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool)
    .await?;
    Ok(row)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateTariffCategory) -> DomainResult<TariffCategory> {
    let mut row = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        row.code = v;
    }
    if let Some(v) = cmd.name {
        row.name = v;
    }
    if let Some(v) = cmd.discount_rate {
        row.discount_rate = v;
    }
    if let Some(v) = cmd.active {
        row.active = v;
    }
    row.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE tariff_categories
         SET code = ?, name = ?, discount_rate = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.discount_rate)
    .bind(&row.active)
    .bind(&row.updated_at)
    .bind(&row.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Tariff category {}", row.id)));
    }
    Ok(row)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM tariff_categories WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Tariff category {id}")));
    }
    Ok(())
}


