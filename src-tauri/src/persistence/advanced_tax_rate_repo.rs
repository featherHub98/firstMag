use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{
    AdvancedTaxRate, CreateAdvancedTaxRate, DomainError, DomainResult, UpdateAdvancedTaxRate,
};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<AdvancedTaxRate>> {
    let rows = sqlx::query_as::<_, AdvancedTaxRate>(
        "SELECT * FROM advanced_tax_rates ORDER BY active DESC, code",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<AdvancedTaxRate> {
    sqlx::query_as::<_, AdvancedTaxRate>("SELECT * FROM advanced_tax_rates WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Advanced tax rate {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<AdvancedTaxRate>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, AdvancedTaxRate>(
        "SELECT * FROM advanced_tax_rates
         WHERE code LIKE ?1 OR name LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(
    pool: &SqlitePool,
    cmd: CreateAdvancedTaxRate,
) -> DomainResult<AdvancedTaxRate> {
    let row = AdvancedTaxRate::new(cmd);
    sqlx::query(
        "INSERT INTO advanced_tax_rates
         (id, code, name, rate, surcharge_rate, withholding_rate, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&row.id)
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.rate)
    .bind(&row.surcharge_rate)
    .bind(&row.withholding_rate)
    .bind(&row.active)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool)
    .await?;
    Ok(row)
}

pub async fn update(
    pool: &SqlitePool,
    cmd: UpdateAdvancedTaxRate,
) -> DomainResult<AdvancedTaxRate> {
    let mut row = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        row.code = v;
    }
    if let Some(v) = cmd.name {
        row.name = v;
    }
    if let Some(v) = cmd.rate {
        row.rate = v;
    }
    if let Some(v) = cmd.surcharge_rate {
        row.surcharge_rate = v;
    }
    if let Some(v) = cmd.withholding_rate {
        row.withholding_rate = v;
    }
    if let Some(v) = cmd.active {
        row.active = v;
    }
    row.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE advanced_tax_rates
         SET code = ?, name = ?, rate = ?, surcharge_rate = ?, withholding_rate = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.rate)
    .bind(&row.surcharge_rate)
    .bind(&row.withholding_rate)
    .bind(&row.active)
    .bind(&row.updated_at)
    .bind(&row.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!(
            "Advanced tax rate {}",
            row.id
        )));
    }
    Ok(row)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM advanced_tax_rates WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Advanced tax rate {id}")));
    }
    Ok(())
}


