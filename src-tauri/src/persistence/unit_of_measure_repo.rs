use chrono::Utc;
use sqlx::SqlitePool;

use crate::domain::{
    CreateUnitOfMeasure, DomainError, DomainResult, UnitOfMeasure, UpdateUnitOfMeasure,
};

const UNIT_SELECT: &str = "
    SELECT
        id,
        name,
        symbol,
        1 AS active,
        COALESCE(NULLIF('', ''), datetime('now')) AS created_at,
        COALESCE(NULLIF('', ''), datetime('now')) AS updated_at
    FROM units
";

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<UnitOfMeasure>> {
    let rows = sqlx::query_as::<_, UnitOfMeasure>(&format!("{UNIT_SELECT} ORDER BY name"))
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<UnitOfMeasure> {
    sqlx::query_as::<_, UnitOfMeasure>(&format!("{UNIT_SELECT} WHERE id = ?"))
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Unit of measure {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<UnitOfMeasure>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, UnitOfMeasure>(&format!(
        "{UNIT_SELECT} WHERE name LIKE ?1 OR symbol LIKE ?1 ORDER BY name LIMIT 50"
    ))
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateUnitOfMeasure) -> DomainResult<UnitOfMeasure> {
    let unit = UnitOfMeasure::new(cmd);
    sqlx::query("INSERT INTO units (id, name, symbol) VALUES (?, ?, ?)")
        .bind(&unit.id)
        .bind(&unit.name)
        .bind(&unit.symbol)
        .execute(pool)
        .await?;
    Ok(unit)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateUnitOfMeasure) -> DomainResult<UnitOfMeasure> {
    let mut unit = get_by_id(pool, &cmd.id).await?;
    if let Some(v) = cmd.name {
        unit.name = v;
    }
    if let Some(v) = cmd.symbol {
        unit.symbol = v;
    }
    if let Some(v) = cmd.active {
        unit.active = v;
    }
    unit.updated_at = Utc::now();

    let result = sqlx::query("UPDATE units SET name = ?, symbol = ? WHERE id = ?")
        .bind(&unit.name)
        .bind(&unit.symbol)
        .bind(&unit.id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!(
            "Unit of measure {}",
            unit.id
        )));
    }
    Ok(unit)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM units WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Unit of measure {id}")));
    }
    Ok(())
}


