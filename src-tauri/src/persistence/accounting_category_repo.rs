use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{
    AccountingCategory, CreateAccountingCategory, DomainError, DomainResult,
    UpdateAccountingCategory,
};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<AccountingCategory>> {
    let rows = sqlx::query_as::<_, AccountingCategory>(
        "SELECT * FROM accounting_categories ORDER BY active DESC, code",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<AccountingCategory> {
    sqlx::query_as::<_, AccountingCategory>("SELECT * FROM accounting_categories WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Accounting category {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<AccountingCategory>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, AccountingCategory>(
        "SELECT * FROM accounting_categories
         WHERE code LIKE ?1 OR name LIKE ?1 OR account_number LIKE ?1
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
    cmd: CreateAccountingCategory,
) -> DomainResult<AccountingCategory> {
    let row = AccountingCategory::new(cmd);
    sqlx::query(
        "INSERT INTO accounting_categories (id, code, name, account_number, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&row.id)
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.account_number)
    .bind(&row.active)
    .bind(&row.created_at)
    .bind(&row.updated_at)
    .execute(pool)
    .await?;
    Ok(row)
}

pub async fn update(
    pool: &SqlitePool,
    cmd: UpdateAccountingCategory,
) -> DomainResult<AccountingCategory> {
    let mut row = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        row.code = v;
    }
    if let Some(v) = cmd.name {
        row.name = v;
    }
    if let Some(v) = cmd.account_number {
        row.account_number = v;
    }
    if let Some(v) = cmd.active {
        row.active = v;
    }
    row.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE accounting_categories
         SET code = ?, name = ?, account_number = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&row.code)
    .bind(&row.name)
    .bind(&row.account_number)
    .bind(&row.active)
    .bind(&row.updated_at)
    .bind(&row.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!(
            "Accounting category {}",
            row.id
        )));
    }
    Ok(row)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM accounting_categories WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Accounting category {id}")));
    }
    Ok(())
}


