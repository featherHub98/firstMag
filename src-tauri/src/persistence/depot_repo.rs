use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{CreateDepot, Depot, DomainError, DomainResult, UpdateDepot};

const DEPOT_SELECT: &str = "
    SELECT
        id,
        code,
        name,
        address,
        active,
        datetime('now') AS created_at,
        datetime('now') AS updated_at
    FROM depots
";

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Depot>> {
    let rows = sqlx::query_as::<_, Depot>(&format!("{DEPOT_SELECT} ORDER BY active DESC, code"))
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Depot> {
    sqlx::query_as::<_, Depot>(&format!("{DEPOT_SELECT} WHERE id = ?"))
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Depot {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Depot>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Depot>(&format!(
        "{DEPOT_SELECT}
         WHERE code LIKE ?1 OR name LIKE ?1 OR address LIKE ?1
         ORDER BY active DESC, code
         LIMIT 50"
    ))
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateDepot) -> DomainResult<Depot> {
    let depot = Depot::new(cmd);
    sqlx::query("INSERT INTO depots (id, code, name, address, active) VALUES (?, ?, ?, ?, ?)")
        .bind(&depot.id)
        .bind(&depot.code)
        .bind(&depot.name)
        .bind(&depot.address)
        .bind(&depot.active)
        .execute(pool)
        .await?;
    Ok(depot)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateDepot) -> DomainResult<Depot> {
    let mut depot = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.code {
        depot.code = v;
    }
    if let Some(v) = cmd.name {
        depot.name = v;
    }
    if let Some(v) = cmd.address {
        depot.address = v;
    }
    if let Some(v) = cmd.active {
        depot.active = v;
    }
    depot.updated_at = Utc::now();

    let result =
        sqlx::query("UPDATE depots SET code = ?, name = ?, address = ?, active = ? WHERE id = ?")
            .bind(&depot.code)
            .bind(&depot.name)
            .bind(&depot.address)
            .bind(&depot.active)
            .bind(&depot.id)
            .execute(pool)
            .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Depot {}", depot.id)));
    }
    Ok(depot)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM depots WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Depot {id}")));
    }
    Ok(())
}


