use sqlx::SqlitePool;
use crate::domain::stock::{StockLevel, StockMovement};
use crate::domain::DomainResult;

pub async fn get_level(pool: &SqlitePool, article_id: &str) -> DomainResult<StockLevel> {
    let level = sqlx::query_as::<_, StockLevel>(
        "SELECT article_id, 'main' as depot_id, COALESCE(SUM(CASE WHEN movement_type IN ('entry','transfer_in') THEN quantity ELSE -quantity END), 0) as quantity
         FROM stock_movements WHERE article_id = ? GROUP BY article_id"
    )
    .bind(article_id)
    .fetch_optional(pool)
    .await?
    .unwrap_or(StockLevel::new(article_id, "main", 0));
    Ok(level)
}

pub async fn list_movements(pool: &SqlitePool, article_id: Option<&str>) -> DomainResult<Vec<StockMovement>> {
    let rows = if let Some(aid) = article_id {
        sqlx::query_as::<_, StockMovement>(
            "SELECT * FROM stock_movements WHERE article_id = ? ORDER BY created_at DESC LIMIT 100"
        )
        .bind(aid)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, StockMovement>(
            "SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 100"
        )
        .fetch_all(pool)
        .await?
    };
    Ok(rows)
}
