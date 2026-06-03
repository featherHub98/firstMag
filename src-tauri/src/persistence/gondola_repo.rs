use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{CreateGondola, DomainError, DomainResult, Gondola, UpdateGondola};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Gondola>> {
    let rows = sqlx::query_as::<_, Gondola>("SELECT * FROM gondoles ORDER BY active DESC, code")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Gondola> {
    sqlx::query_as::<_, Gondola>("SELECT * FROM gondoles WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Gondola {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Gondola>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Gondola>(
        "SELECT * FROM gondoles
         WHERE code LIKE ?1 OR name LIKE ?1 OR depot_id LIKE ?1 OR rayon_id LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50",
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateGondola) -> DomainResult<Gondola> {
    let gondola = Gondola::new(cmd);
    sqlx::query(
        "INSERT INTO gondoles (id, code, name, depot_id, rayon_id, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&gondola.id)
    .bind(&gondola.code)
    .bind(&gondola.name)
    .bind(&gondola.depot_id)
    .bind(&gondola.rayon_id)
    .bind(&gondola.active)
    .bind(&gondola.created_at)
    .bind(&gondola.updated_at)
    .execute(pool)
    .await?;
    Ok(gondola)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateGondola) -> DomainResult<Gondola> {
    let mut gondola = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        gondola.code = v;
    }
    if let Some(v) = cmd.name {
        gondola.name = v;
    }
    if let Some(v) = cmd.depot_id {
        gondola.depot_id = v;
    }
    if let Some(v) = cmd.rayon_id {
        gondola.rayon_id = v;
    }
    if let Some(v) = cmd.active {
        gondola.active = v;
    }
    gondola.updated_at = Utc::now();

    let result = sqlx::query(
        "UPDATE gondoles
         SET code = ?, name = ?, depot_id = ?, rayon_id = ?, active = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&gondola.code)
    .bind(&gondola.name)
    .bind(&gondola.depot_id)
    .bind(&gondola.rayon_id)
    .bind(&gondola.active)
    .bind(&gondola.updated_at)
    .bind(&gondola.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Gondola {}", gondola.id)));
    }
    Ok(gondola)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM gondoles WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Gondola {id}")));
    }
    Ok(())
}


