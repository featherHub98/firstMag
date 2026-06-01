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
