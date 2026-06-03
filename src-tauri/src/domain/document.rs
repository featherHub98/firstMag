use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DocumentType {
    #[serde(rename = "quote", alias = "Quote")]
    Quote,
    #[serde(rename = "order", alias = "Order")]
    Order,
    #[serde(rename = "delivery", alias = "Delivery")]
    Delivery,
    #[serde(rename = "invoice", alias = "Invoice")]
    Invoice,
    #[serde(rename = "credit_note", alias = "CreditNote")]
    CreditNote,
    #[serde(rename = "purchase_order", alias = "PurchaseOrder")]
    PurchaseOrder,
    #[serde(rename = "purchase_delivery", alias = "PurchaseDelivery")]
    PurchaseDelivery,
    #[serde(rename = "purchase_invoice", alias = "PurchaseInvoice")]
    PurchaseInvoice,
    #[serde(rename = "purchase_return", alias = "PurchaseReturn")]
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
        match s.to_ascii_lowercase().as_str() {
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
        matches!(
            self,
            Self::Quote | Self::Order | Self::Delivery | Self::Invoice | Self::CreditNote
        )
    }

    pub fn is_purchase(&self) -> bool {
        matches!(
            self,
            Self::PurchaseOrder
                | Self::PurchaseDelivery
                | Self::PurchaseInvoice
                | Self::PurchaseReturn
        )
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
    #[serde(rename = "draft", alias = "Draft")]
    Draft,
    #[serde(rename = "confirmed", alias = "Confirmed")]
    Confirmed,
    #[serde(rename = "transformed", alias = "Transformed")]
    Transformed,
    #[serde(rename = "cancelled", alias = "Cancelled")]
    Cancelled,
    #[serde(rename = "partial", alias = "Partial")]
    Partial,
    #[serde(rename = "paid", alias = "Paid")]
    Paid,
}

impl DocumentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Confirmed => "confirmed",
            Self::Transformed => "transformed",
            Self::Cancelled => "cancelled",
            Self::Partial => "partial",
            Self::Paid => "paid",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "draft" => Some(Self::Draft),
            "confirmed" => Some(Self::Confirmed),
            "transformed" => Some(Self::Transformed),
            "cancelled" => Some(Self::Cancelled),
            "partial" => Some(Self::Partial),
            "paid" => Some(Self::Paid),
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
    use serde_json::from_str;

    #[test]
    fn test_document_type_from_str() {
        assert_eq!(
            DocumentType::from_str("invoice"),
            Some(DocumentType::Invoice)
        );
        assert_eq!(DocumentType::from_str("quote"), Some(DocumentType::Quote));
        assert_eq!(DocumentType::from_str("unknown"), None);
    }

    #[test]
    fn test_document_type_transform() {
        assert_eq!(
            DocumentType::Quote.transform_to(),
            Some(DocumentType::Order)
        );
        assert_eq!(
            DocumentType::Order.transform_to(),
            Some(DocumentType::Delivery)
        );
        assert_eq!(
            DocumentType::Delivery.transform_to(),
            Some(DocumentType::Invoice)
        );
        assert_eq!(DocumentType::Invoice.transform_to(), None);
    }

    #[test]
    fn test_document_type_is_sale() {
        assert!(DocumentType::Invoice.is_sale());
        assert!(!DocumentType::PurchaseInvoice.is_sale());
    }

    #[test]
    fn test_document_status_roundtrip() {
        for s in [
            DocumentStatus::Draft,
            DocumentStatus::Confirmed,
            DocumentStatus::Transformed,
            DocumentStatus::Cancelled,
            DocumentStatus::Partial,
            DocumentStatus::Paid,
        ] {
            assert_eq!(DocumentStatus::from_str(s.as_str()), Some(s));
        }
    }

    #[test]
    fn test_document_new() {
        let doc = Document::new(
            "id1".into(),
            "invoice",
            "FACT-000001",
            "p1",
            "Client X",
            "note",
            1000,
            190,
            1190,
        );
        assert_eq!(doc.doc_type, "invoice");
        assert_eq!(doc.status, "draft");
        assert_eq!(doc.total_ttc, 1190);
    }

    #[test]
    fn test_document_type_serde_accepts_lowercase() {
        assert_eq!(from_str::<DocumentType>("\"invoice\"").ok(), Some(DocumentType::Invoice));
        assert_eq!(
            from_str::<DocumentType>("\"purchase_return\"").ok(),
            Some(DocumentType::PurchaseReturn)
        );
    }

    #[test]
    fn test_document_type_serde_accepts_legacy_pascal_case() {
        assert_eq!(from_str::<DocumentType>("\"Invoice\"").ok(), Some(DocumentType::Invoice));
        assert_eq!(
            from_str::<DocumentType>("\"PurchaseReturn\"").ok(),
            Some(DocumentType::PurchaseReturn)
        );
    }
}

impl Document {
    pub fn new(
        id: String,
        doc_type: &str,
        doc_number: &str,
        partner_id: &str,
        partner_name: &str,
        notes: &str,
        total_ht: i64,
        total_tax: i64,
        total_ttc: i64,
    ) -> Self {
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
