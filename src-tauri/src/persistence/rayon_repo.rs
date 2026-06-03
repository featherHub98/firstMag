use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{CreateRayon, DomainError, DomainResult, Rayon, UpdateRayon};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Rayon>> {
    let rows = sqlx::query_as::<_, Rayon>("SELECT * FROM rayons ORDER BY active DESC, code")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Rayon> {
    sqlx::query_as::<_, Rayon>("SELECT * FROM rayons WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Rayon {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Rayon>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Rayon>(
        "SELECT * FROM rayons
         WHERE code LIKE ?1 OR name LIKE ?1 OR depot_id LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateRayon) -> DomainResult<Rayon> {
    let rayon = Rayon::new(cmd);
    sqlx::query(
        "INSERT INTO rayons (id, code, name, depot_id, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&rayon.id)
    .bind(&rayon.code)
    .bind(&rayon.name)
    .bind(&rayon.depot_id)
    .bind(&rayon.active)
    .bind(&rayon.created_at)
    .bind(&rayon.updated_at)
    .execute(pool)
    .await?;
    Ok(rayon)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateRayon) -> DomainResult<Rayon> {
    let mut rayon = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        rayon.code = v;
    }
    if let Some(v) = cmd.name {
        rayon.name = v;
    }
    if let Some(v) = cmd.depot_id {
        rayon.depot_id = v;
    }
    if let Some(v) = cmd.active {
        rayon.active = v;
    }
    rayon.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE rayons
         SET code = ?, name = ?, depot_id = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&rayon.code)
    .bind(&rayon.name)
    .bind(&rayon.depot_id)
    .bind(&rayon.active)
    .bind(&rayon.updated_at)
    .bind(&rayon.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Rayon {}", rayon.id)));
    }
    Ok(rayon)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM rayons WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Rayon {id}")));
    }
    Ok(())
}


