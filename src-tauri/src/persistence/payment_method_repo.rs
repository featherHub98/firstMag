use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{
    CreatePaymentMethod, DomainError, DomainResult, PaymentMethod, UpdatePaymentMethod,
};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<PaymentMethod>> {
    let rows = sqlx::query_as::<_, PaymentMethod>(
        "SELECT * FROM payment_methods ORDER BY active DESC, code",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<PaymentMethod> {
    sqlx::query_as::<_, PaymentMethod>("SELECT * FROM payment_methods WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Payment method {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<PaymentMethod>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, PaymentMethod>(
        "SELECT * FROM payment_methods
         WHERE code LIKE ?1 OR name LIKE ?1 OR description LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreatePaymentMethod) -> DomainResult<PaymentMethod> {
    let method = PaymentMethod::new(cmd);
    sqlx::query(
        "INSERT INTO payment_methods (id, code, name, description, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&method.id)
    .bind(&method.code)
    .bind(&method.name)
    .bind(&method.description)
    .bind(&method.active)
    .bind(&method.created_at)
    .bind(&method.updated_at)
    .execute(pool)
    .await?;
    Ok(method)
}

pub async fn update(pool: &SqlitePool, cmd: UpdatePaymentMethod) -> DomainResult<PaymentMethod> {
    let mut method = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        method.code = v;
    }
    if let Some(v) = cmd.name {
        method.name = v;
    }
    if let Some(v) = cmd.description {
        method.description = v;
    }
    if let Some(v) = cmd.active {
        method.active = v;
    }
    method.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE payment_methods
         SET code = ?, name = ?, description = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&method.code)
    .bind(&method.name)
    .bind(&method.description)
    .bind(&method.active)
    .bind(&method.updated_at)
    .bind(&method.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!(
            "Payment method {}",
            method.id
        )));
    }
    Ok(method)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM payment_methods WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Payment method {id}")));
    }
    Ok(())
}


