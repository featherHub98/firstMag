use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

use crate::AppState;

#[derive(Serialize)]
pub struct DashboardStats {
    pub total_articles: i64,
    pub priced_articles: i64,
    pub total_clients: i64,
    pub total_documents: i64,
    pub stock_value_pa: i64,
    pub stock_value_pv: i64,
    pub recent_documents: Vec<DocSummary>,
}

#[derive(Serialize)]
pub struct DocSummary {
    pub id: String,
    pub doc_number: String,
    pub doc_type: String,
    pub partner_name: String,
    pub total_ttc: i64,
    pub created_at: String,
}

async fn query_i64(pool: &SqlitePool, sql: &str) -> i64 {
    sqlx::query_scalar(sql).fetch_one(pool).await.unwrap_or(0)
}

#[tauri::command]
pub async fn get_dashboard_stats(state: State<'_, AppState>) -> Result<DashboardStats, String> {
    let pool = &state.db;

    let total_articles = query_i64(pool, "SELECT COUNT(*) FROM articles").await;
    let priced_articles = query_i64(
        pool,
        "SELECT COUNT(*) FROM articles WHERE purchase_price > 0",
    )
    .await;
    let total_clients = query_i64(
        pool,
        "SELECT COUNT(*) FROM partners WHERE partner_type='client'",
    )
    .await;
    let total_documents = query_i64(pool, "SELECT COUNT(*) FROM documents").await;
    let stock_value_pa = query_i64(
        pool,
        "SELECT COALESCE(SUM(purchase_price), 0) FROM articles",
    )
    .await;
    let stock_value_pv = query_i64(pool, "SELECT COALESCE(SUM(sale_price), 0) FROM articles").await;

    let recent_documents: Vec<DocSummary> = sqlx::query_as::<_, (String, String, String, String, i64, String)>(
        "SELECT id, doc_number, doc_type, partner_name, total_ttc, created_at FROM documents ORDER BY created_at DESC LIMIT 5"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?
    .into_iter()
    .map(|(id, doc_number, doc_type, partner_name, total_ttc, created_at)| DocSummary {
        id, doc_number, doc_type, partner_name, total_ttc, created_at,
    })
    .collect();

    Ok(DashboardStats {
        total_articles,
        priced_articles,
        total_clients,
        total_documents,
        stock_value_pa,
        stock_value_pv,
        recent_documents,
    })
}
