use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaleReport {
    pub period_start: String,
    pub period_end: String,
    pub total_transactions: i64,
    pub total_quantity: i64,
    pub total_ht: i64,
    pub total_tax: i64,
    pub total_ttc: i64,
    pub cash_total: i64,
    pub card_total: i64,
    pub cheque_total: i64,
    pub transfer_total: i64,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentSummary {
    pub payment_mode: String,
    pub total: i64,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportCatalogItem {
    pub id: String,
    pub title: String,
    pub legacy_label: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SettlementLedgerRow {
    pub ticket_id: String,
    pub mode: String,
    pub amount: i64,
    pub reference: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StockMovementReportRow {
    pub movement_type: String,
    pub article_id: String,
    pub article_name: String,
    pub depot_id: String,
    pub quantity: i64,
    pub reference: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct BarcodeReportRow {
    pub article_id: String,
    pub article_code: String,
    pub article_name: String,
    pub barcode: String,
    pub alt_code: Option<String>,
    pub alt_code_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TurnoverPoint {
    pub period: String,
    pub total_ttc: i64,
    pub doc_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartnerAnalysisRow {
    pub partner_id: String,
    pub partner_name: String,
    pub partner_type: String,
    pub total_ttc: i64,
    pub invoice_count: i64,
    pub balance: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManagementDashboardReport {
    pub turnover_evolution: Vec<TurnoverPoint>,
    pub top_clients: Vec<PartnerAnalysisRow>,
    pub top_suppliers: Vec<PartnerAnalysisRow>,
    pub stock_total_quantity: i64,
    pub stock_entries: i64,
    pub stock_exits: i64,
    pub cash_in_total: i64,
    pub cash_out_total: i64,
}
