use crate::domain::stock::{StockLevel, StockMovement, StockReport};
use crate::domain::DomainResult;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct StockReportFilter<'a> {
    pub depot_id: Option<&'a str>,
    pub article_id: Option<&'a str>,
    pub date_from: Option<&'a str>,
    pub date_to: Option<&'a str>,
}

pub async fn get_level(pool: &SqlitePool, article_id: &str) -> DomainResult<StockLevel> {
    let level = sqlx::query_as::<_, StockLevel>(
        "SELECT article_id, 'main' as depot_id, COALESCE(SUM(CASE WHEN movement_type IN ('entry','transfer_in') THEN quantity ELSE -quantity END), 0) as quantity
         FROM stock_movements WHERE article_id = ? GROUP BY article_id"
    )
    .bind(&article_id)
    .fetch_optional(pool)
    .await?
    .unwrap_or(StockLevel::new(article_id, "main", 0));
    Ok(level)
}

pub async fn list_movements(
    pool: &SqlitePool,
    article_id: Option<&str>,
) -> DomainResult<Vec<StockMovement>> {
    let rows = if let Some(aid) = article_id {
        sqlx::query_as::<_, StockMovement>(
            "SELECT * FROM stock_movements WHERE article_id = ? ORDER BY created_at DESC LIMIT 100",
        )
        .bind(&aid)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, StockMovement>(
            "SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 100",
        )
        .fetch_all(pool)
        .await?
    };
    Ok(rows)
}

pub async fn create_movement(
    pool: &SqlitePool,
    movement_type: &str,
    article_id: &str,
    depot_id: &str,
    target_depot_id: Option<&str>,
    quantity: i64,
    reference: &str,
    notes: &str,
) -> DomainResult<StockMovement> {
    let id = Uuid::new_v4().to_string();
    let created_at = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO stock_movements (id, movement_type, article_id, depot_id, target_depot_id, quantity, reference, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&movement_type)
    .bind(&article_id)
    .bind(&depot_id)
    .bind(&target_depot_id)
    .bind(&quantity)
    .bind(&reference)
    .bind(&notes)
    .bind(&created_at)
    .execute(pool)
    .await?;

    let row =
        sqlx::query_as::<_, StockMovement>("SELECT * FROM stock_movements WHERE id = ? LIMIT 1")
            .bind(&id)
            .fetch_one(pool)
            .await?;

    Ok(row)
}

pub async fn update_movement(
    pool: &SqlitePool,
    id: &str,
    movement_type: &str,
    article_id: &str,
    depot_id: &str,
    target_depot_id: Option<&str>,
    quantity: i64,
    reference: &str,
    notes: &str,
) -> DomainResult<StockMovement> {
    sqlx::query(
        "UPDATE stock_movements
         SET movement_type = ?, article_id = ?, depot_id = ?, target_depot_id = ?, quantity = ?, reference = ?, notes = ?
         WHERE id = ?",
    )
    .bind(&movement_type)
    .bind(&article_id)
    .bind(&depot_id)
    .bind(&target_depot_id)
    .bind(&quantity)
    .bind(&reference)
    .bind(&notes)
    .bind(&id)
    .execute(pool)
    .await?;

    let row =
        sqlx::query_as::<_, StockMovement>("SELECT * FROM stock_movements WHERE id = ? LIMIT 1")
            .bind(&id)
            .fetch_one(pool)
            .await?;

    Ok(row)
}

pub async fn delete_movement(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    sqlx::query("DELETE FROM stock_movements WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn list_reports(
    pool: &SqlitePool,
    filter: StockReportFilter<'_>,
) -> DomainResult<Vec<StockReport>> {
    let rows = sqlx::query_as::<_, StockReport>(
        "WITH movement_effects AS (
            SELECT
                article_id,
                depot_id AS depot_id,
                CASE movement_type
                    WHEN 'entry' THEN quantity
                    WHEN 'exit' THEN -quantity
                    WHEN 'transfer' THEN -quantity
                    ELSE 0
                END AS delta,
                created_at
            FROM stock_movements
            UNION ALL
            SELECT
                article_id,
                target_depot_id AS depot_id,
                CASE
                    WHEN movement_type = 'transfer' AND target_depot_id IS NOT NULL THEN quantity
                    ELSE 0
                END AS delta,
                created_at
            FROM stock_movements
            WHERE movement_type = 'transfer' AND target_depot_id IS NOT NULL
        ),
        range_effects AS (
            SELECT article_id, depot_id, delta, created_at
            FROM movement_effects
            WHERE depot_id IS NOT NULL
              AND (?1 IS NULL OR depot_id = ?1)
              AND (?2 IS NULL OR article_id = ?2)
              AND (?3 IS NULL OR date(created_at) >= date(?3))
              AND (?4 IS NULL OR date(created_at) <= date(?4))
        ),
        initial_effects AS (
            SELECT
                article_id,
                depot_id,
                COALESCE(SUM(delta), 0) AS initial_qty
            FROM movement_effects
            WHERE depot_id IS NOT NULL
              AND (?1 IS NULL OR depot_id = ?1)
              AND (?2 IS NULL OR article_id = ?2)
              AND (?3 IS NOT NULL AND date(created_at) < date(?3))
            GROUP BY article_id, depot_id
        ),
        aggregated AS (
            SELECT
                article_id,
                depot_id,
                COALESCE(SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END), 0) AS entries_qty,
                COALESCE(SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END), 0) AS exits_qty,
                MAX(created_at) AS last_date
            FROM range_effects
            GROUP BY article_id, depot_id
        )
        SELECT
            COALESCE(aggregated.last_date, COALESCE(?3, datetime('now'))) AS date,
            aggregated.depot_id AS depot_id,
            aggregated.article_id AS article_id,
            COALESCE(initial_effects.initial_qty, 0) AS initial_quantity,
            aggregated.entries_qty AS entries_quantity,
            aggregated.exits_qty AS exits_quantity,
            COALESCE(initial_effects.initial_qty, 0) + aggregated.entries_qty - aggregated.exits_qty AS final_quantity,
            aggregated.entries_qty - aggregated.exits_qty AS variance
        FROM aggregated
        LEFT JOIN initial_effects
          ON initial_effects.article_id = aggregated.article_id
         AND initial_effects.depot_id = aggregated.depot_id
        ORDER BY date DESC, aggregated.depot_id, aggregated.article_id"
    )
    .bind(&filter.depot_id)
    .bind(&filter.article_id)
    .bind(&filter.date_from)
    .bind(&filter.date_to)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}


