use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketLine {
    pub id: String,
    pub ticket_id: String,
    pub article_id: String,
    pub article_name: String,
    pub quantity: i64,
    pub unit_price: i64,
    pub tax_rate: i64,
    pub total_ht: i64,
    pub total_ttc: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentLine {
    pub id: String,
    pub ticket_id: String,
    pub payment_mode: String,
    pub amount: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PosSession {
    pub id: String,
    pub register_id: String,
    pub cashier_id: String,
    pub opening_fund: i64,
    pub closing_fund: Option<i64>,
    pub status: String,
    pub ticket_count: i64,
    pub total_sales: i64,
    pub opened_at: DateTime<Utc>,
    pub closed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PosTicket {
    pub id: String,
    pub session_id: String,
    pub ticket_number: i64,
    pub status: String,
    pub total_ht: i64,
    pub total_tax: i64,
    pub total_ttc: i64,
    pub payment_status: String,
    pub created_at: DateTime<Utc>,
}

impl PosSession {
    pub fn open(register_id: &str, cashier_id: &str, opening_fund: i64) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            register_id: register_id.to_string(),
            cashier_id: cashier_id.to_string(),
            opening_fund,
            closing_fund: None,
            status: "open".to_string(),
            ticket_count: 0,
            total_sales: 0,
            opened_at: Utc::now(),
            closed_at: None,
        }
    }
}
