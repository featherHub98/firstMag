use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DocumentType {
    Quote,
    Order,
    Delivery,
    Invoice,
    CreditNote,
    PurchaseOrder,
    PurchaseDelivery,
    PurchaseInvoice,
    PurchaseReturn,
}

impl DocumentType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Quote => "quote",
            Self::Order => "order",
            Self::Delivery => "delivery",
            Self::Invoice => "invoice",
            Self::CreditNote => "credit_note",
            Self::PurchaseOrder => "purchase_order",
            Self::PurchaseDelivery => "purchase_delivery",
            Self::PurchaseInvoice => "purchase_invoice",
            Self::PurchaseReturn => "purchase_return",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "quote" => Some(Self::Quote),
            "order" => Some(Self::Order),
            "delivery" => Some(Self::Delivery),
            "invoice" => Some(Self::Invoice),
            "credit_note" => Some(Self::CreditNote),
            "purchase_order" => Some(Self::PurchaseOrder),
            "purchase_delivery" => Some(Self::PurchaseDelivery),
            "purchase_invoice" => Some(Self::PurchaseInvoice),
            "purchase_return" => Some(Self::PurchaseReturn),
            _ => None,
        }
    }

    pub fn is_sale(&self) -> bool {
        matches!(self, Self::Quote | Self::Order | Self::Delivery | Self::Invoice | Self::CreditNote)
    }

    pub fn is_purchase(&self) -> bool {
        matches!(self, Self::PurchaseOrder | Self::PurchaseDelivery | Self::PurchaseInvoice | Self::PurchaseReturn)
    }

    pub fn transform_to(&self) -> Option<DocumentType> {
        match self {
            Self::Quote => Some(Self::Order),
            Self::Order => Some(Self::Delivery),
            Self::Delivery => Some(Self::Invoice),
            Self::PurchaseOrder => Some(Self::PurchaseDelivery),
            Self::PurchaseDelivery => Some(Self::PurchaseInvoice),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DocumentStatus {
    Draft,
    Confirmed,
    Transformed,
    Cancelled,
}

impl DocumentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Confirmed => "confirmed",
            Self::Transformed => "transformed",
            Self::Cancelled => "cancelled",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "confirmed" => Some(Self::Confirmed),
            "transformed" => Some(Self::Transformed),
            "cancelled" => Some(Self::Cancelled),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Document {
    pub id: String,
    pub doc_type: String,
    pub doc_number: String,
    pub status: String,
    pub partner_id: String,
    pub partner_name: String,
    pub total_ht: i64,
    pub total_tax: i64,
    pub total_ttc: i64,
    pub notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DocumentLine {
    pub id: String,
    pub document_id: String,
    pub article_id: String,
    pub article_name: String,
    pub quantity: i64,
    pub unit_price: i64,
    pub tax_rate: i64,
    pub total_ht: i64,
    pub total_ttc: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDocument {
    pub doc_type: DocumentType,
    pub partner_id: String,
    pub partner_name: String,
    pub notes: String,
    pub lines: Vec<CreateDocumentLine>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDocumentLine {
    pub article_id: String,
    pub article_name: String,
    pub quantity: i64,
    pub unit_price: i64,
    pub tax_rate: i64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_type_from_str() {
        assert_eq!(DocumentType::from_str("invoice"), Some(DocumentType::Invoice));
        assert_eq!(DocumentType::from_str("quote"), Some(DocumentType::Quote));
        assert_eq!(DocumentType::from_str("unknown"), None);
    }

    #[test]
    fn test_document_type_transform() {
        assert_eq!(DocumentType::Quote.transform_to(), Some(DocumentType::Order));
        assert_eq!(DocumentType::Order.transform_to(), Some(DocumentType::Delivery));
        assert_eq!(DocumentType::Delivery.transform_to(), Some(DocumentType::Invoice));
        assert_eq!(DocumentType::Invoice.transform_to(), None);
    }

    #[test]
    fn test_document_type_is_sale() {
        assert!(DocumentType::Invoice.is_sale());
        assert!(!DocumentType::PurchaseInvoice.is_sale());
    }

    #[test]
    fn test_document_status_roundtrip() {
        for s in [DocumentStatus::Draft, DocumentStatus::Confirmed, DocumentStatus::Transformed, DocumentStatus::Cancelled] {
            assert_eq!(DocumentStatus::from_str(s.as_str()), Some(s));
        }
    }

    #[test]
    fn test_document_new() {
        let doc = Document::new("id1".into(), "invoice", "FACT-000001", "p1", "Client X", "note", 1000, 190, 1190);
        assert_eq!(doc.doc_type, "invoice");
        assert_eq!(doc.status, "draft");
        assert_eq!(doc.total_ttc, 1190);
    }
}

impl Document {
    pub fn new(id: String, doc_type: &str, doc_number: &str, partner_id: &str, partner_name: &str, notes: &str,
               total_ht: i64, total_tax: i64, total_ttc: i64) -> Self {
        let now = Utc::now();
        Self {
            id,
            doc_type: doc_type.to_string(),
            doc_number: doc_number.to_string(),
            status: DocumentStatus::Draft.as_str().to_string(),
            partner_id: partner_id.to_string(),
            partner_name: partner_name.to_string(),
            total_ht,
            total_tax,
            total_ttc,
            notes: notes.to_string(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn total_ht_as_float(&self) -> f64 {
        self.total_ht as f64 / 1000.0
    }

    pub fn total_ttc_as_float(&self) -> f64 {
        self.total_ttc as f64 / 1000.0
    }
}
