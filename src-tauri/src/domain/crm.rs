use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PartnerProfile {
    pub partner_id: String,
    pub fiscal_address: String,
    pub commercial_contact: String,
    pub payment_model: String,
    pub shipping_address: String,
    pub currency_code: String,
    pub credit_control_enabled: bool,
    pub loyalty_barcode: String,
    pub family_segment: String,
    pub milestone_tier: String,
    pub deferred_discount_rate: i64,
    pub global_discount_millimes: i64,
    pub allow_deferred_payment: bool,
    pub deposit_balance: i64,
    pub last_visit_at: Option<DateTime<Utc>>,
    pub notes_ext: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpsertPartnerProfile {
    pub partner_id: String,
    pub fiscal_address: String,
    pub commercial_contact: String,
    pub payment_model: String,
    pub shipping_address: String,
    pub currency_code: String,
    pub credit_control_enabled: bool,
    pub loyalty_barcode: String,
    pub family_segment: String,
    pub milestone_tier: String,
    pub deferred_discount_rate: i64,
    pub global_discount_millimes: i64,
    pub allow_deferred_payment: bool,
    pub deposit_balance: i64,
    pub last_visit_at: Option<DateTime<Utc>>,
    pub notes_ext: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartnerKpis {
    pub partner_id: String,
    pub yearly_total_ttc: i64,
    pub monthly_total_ttc: i64,
    pub yearly_invoice_count: i64,
    pub last_invoice_at: Option<DateTime<Utc>>,
    pub last_purchase_at: Option<DateTime<Utc>>,
    pub outstanding_balance: i64,
    pub pending_followups: i64,
    pub open_reclamations: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PartnerFollowUp {
    pub id: String,
    pub partner_id: String,
    pub subject: String,
    pub due_date: Option<DateTime<Utc>>,
    pub status: String,
    pub priority: i64,
    pub notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePartnerFollowUp {
    pub partner_id: String,
    pub subject: String,
    pub due_date: Option<DateTime<Utc>>,
    pub priority: i64,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePartnerFollowUpStatus {
    pub id: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PartnerReclamation {
    pub id: String,
    pub partner_id: Option<String>,
    pub title: String,
    pub description: String,
    pub status: String,
    pub severity: String,
    pub source: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePartnerReclamation {
    pub partner_id: Option<String>,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePartnerReclamationStatus {
    pub id: String,
    pub status: String,
}

impl PartnerFollowUp {
    pub fn new(cmd: CreatePartnerFollowUp) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            partner_id: cmd.partner_id,
            subject: cmd.subject,
            due_date: cmd.due_date,
            status: "pending".to_string(),
            priority: cmd.priority,
            notes: cmd.notes,
            created_at: now,
            updated_at: now,
        }
    }
}

impl PartnerReclamation {
    pub fn new(cmd: CreatePartnerReclamation) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            partner_id: cmd.partner_id,
            title: cmd.title,
            description: cmd.description,
            status: "open".to_string(),
            severity: cmd.severity,
            source: cmd.source,
            created_at: now,
            updated_at: now,
            resolved_at: None,
        }
    }
}
