use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{
    CreateProductRange, DomainError, DomainResult, ProductRange, UpdateProductRange,
};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<ProductRange>> {
    let rows = sqlx::query_as::<_, ProductRange>(
        "SELECT * FROM product_ranges ORDER BY active DESC, code",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<ProductRange> {
    sqlx::query_as::<_, ProductRange>("SELECT * FROM product_ranges WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Product range {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<ProductRange>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, ProductRange>(
        "SELECT * FROM product_ranges
         WHERE code LIKE ?1 OR name LIKE ?1 OR description LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateProductRange) -> DomainResult<ProductRange> {
    let row = ProductRange::new(cmd);
    sqlx::query(
        "INSERT INTO product_ranges (id, code, name, description, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&row.id)
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.description)
    .bind(&row.active)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool)
    .await?;
    Ok(row)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateProductRange) -> DomainResult<ProductRange> {
    let mut row = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        row.code = v;
    }
    if let Some(v) = cmd.name {
        row.name = v;
    }
    if let Some(v) = cmd.description {
        row.description = v;
    }
    if let Some(v) = cmd.active {
        row.active = v;
    }
    row.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE product_ranges
         SET code = ?, name = ?, description = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.description)
    .bind(&row.active)
    .bind(&row.updated_at)
    .bind(&row.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Product range {}", row.id)));
    }
    Ok(row)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM product_ranges WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Product range {id}")));
    }
    Ok(())
}


