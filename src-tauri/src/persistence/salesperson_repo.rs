use sqlx::SqlitePool;

use crate::domain::{CreateSalesperson, DomainError, DomainResult, Salesperson, UpdateSalesperson};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Salesperson>> {
    let rows = sqlx::query_as::<_, Salesperson>(
        "SELECT * FROM salespersons ORDER BY active DESC, last_name, first_name",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Salesperson> {
    sqlx::query_as::<_, Salesperson>("SELECT * FROM salespersons WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Salesperson {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Salesperson>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Salesperson>(
        "SELECT * FROM salespersons
         WHERE code LIKE ?1 OR first_name LIKE ?1 OR last_name LIKE ?1 OR phone LIKE ?1 OR email LIKE ?1
         ORDER BY active DESC, last_name, first_name
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateSalesperson) -> DomainResult<Salesperson> {
    let salesperson = Salesperson::new(cmd);
    sqlx::query(
        "INSERT INTO salespersons (id, code, first_name, last_name, email, phone, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&salesperson.id)
    .bind(&salesperson.code)
    .bind(&salesperson.first_name)
    .bind(&salesperson.last_name)
    .bind(&salesperson.email)
    .bind(&salesperson.phone)
    .bind(&salesperson.active)
    .bind(&salesperson.created_at)
    .bind(&salesperson.updated_at)
    .execute(pool)
    .await?;
    Ok(salesperson)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateSalesperson) -> DomainResult<Salesperson> {
    let mut salesperson = get_by_id(pool, &cmd.id).await?;
    salesperson.apply_update(cmd);
    let result = sqlx::query(
        "UPDATE salespersons
         SET code = ?, first_name = ?, last_name = ?, email = ?, phone = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&salesperson.code)
    .bind(&salesperson.first_name)
    .bind(&salesperson.last_name)
    .bind(&salesperson.email)
    .bind(&salesperson.phone)
    .bind(&salesperson.active)
    .bind(&salesperson.updated_at)
    .bind(&salesperson.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!(
            "Salesperson {}",
            salesperson.id
        )));
    }
    Ok(salesperson)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM salespersons WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Salesperson {id}")));
    }
    Ok(())
}


