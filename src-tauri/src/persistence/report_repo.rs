use sqlx::{SqlitePool, Row};
use crate::domain::{DomainResult, SaleReport};
use chrono::Utc;

pub async fn sales_summary(pool: &SqlitePool, since: &str, until: &str) -> DomainResult<SaleReport> {
    let row = sqlx::query(
        "SELECT
            COALESCE(COUNT(*), 0) as total_transactions,
            COALESCE(SUM(total_ht), 0) as total_ht,
            COALESCE(SUM(total_tax), 0) as total_tax,
            COALESCE(SUM(total_ttc), 0) as total_ttc
         FROM documents
         WHERE doc_type = 'invoice'
           AND status != 'cancelled'
           AND created_at >= ? AND created_at <= ?"
    )
    .bind(since)
    .bind(until)
    .fetch_one(pool)
    .await?;

    let qty_row = sqlx::query(
        "SELECT COALESCE(SUM(quantity), 0) as qty
         FROM document_lines dl
         JOIN documents d ON d.id = dl.document_id
         WHERE d.doc_type = 'invoice'
           AND d.status != 'cancelled'
           AND d.created_at >= ? AND d.created_at <= ?"
    )
    .bind(since)
    .bind(until)
    .fetch_one(pool)
    .await?;

    Ok(SaleReport {
        period_start: since.to_string(),
        period_end: until.to_string(),
        total_transactions: row.get(0),
        total_ht: row.get(1),
        total_tax: row.get(2),
        total_ttc: row.get(3),
        total_quantity: qty_row.get(0),
        cash_total: 0,
        card_total: 0,
        cheque_total: 0,
        transfer_total: 0,
        session_id: None,
    })
}

pub fn today_range() -> (String, String) {
    let now = Utc::now();
    let start = now.date_naive().and_hms_opt(0, 0, 0).unwrap()
        .and_utc().format("%Y-%m-%dT00:00:00Z").to_string();
    let end = now.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
    (start, end)
}

pub fn session_range(session_start: &str, session_end: &str) -> (String, String) {
    (session_start.to_string(), session_end.to_string())
}
