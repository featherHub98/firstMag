use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PartnerType {
    #[serde(rename = "client", alias = "Client")]
    Client,
    #[serde(rename = "supplier", alias = "Supplier")]
    Supplier,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::from_str;

    #[test]
    fn test_partner_type_from_str() {
        assert_eq!(PartnerType::from_str("client"), Some(PartnerType::Client));
        assert_eq!(
            PartnerType::from_str("supplier"),
            Some(PartnerType::Supplier)
        );
        assert_eq!(PartnerType::from_str("other"), None);
    }

    #[test]
    fn test_partner_type_as_str() {
        assert_eq!(PartnerType::Client.as_str(), "client");
        assert_eq!(PartnerType::Supplier.as_str(), "supplier");
    }

    #[test]
    fn test_partner_type_serde_accepts_lowercase() {
        assert_eq!(from_str::<PartnerType>("\"client\"").ok(), Some(PartnerType::Client));
        assert_eq!(
            from_str::<PartnerType>("\"supplier\"").ok(),
            Some(PartnerType::Supplier)
        );
    }

    #[test]
    fn test_partner_type_serde_accepts_legacy_pascal_case() {
        assert_eq!(from_str::<PartnerType>("\"Client\"").ok(), Some(PartnerType::Client));
        assert_eq!(
            from_str::<PartnerType>("\"Supplier\"").ok(),
            Some(PartnerType::Supplier)
        );
    }
}

impl PartnerType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Client => "client",
            Self::Supplier => "supplier",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "client" => Some(Self::Client),
            "supplier" => Some(Self::Supplier),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Partner {
    pub id: String,
    pub partner_type: String,
    pub code: String,
    pub name: String,
    pub address: String,
    pub phone: String,
    pub email: String,
    pub tax_id: String,
    pub country_id: Option<String>,
    pub credit_limit: i64,
    pub balance: i64,
    pub notes: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePartner {
    pub partner_type: PartnerType,
    pub code: String,
    pub name: String,
    pub address: String,
    pub phone: String,
    pub email: String,
    pub tax_id: String,
    pub country_id: Option<String>,
    pub credit_limit: i64,
    pub notes: String,
}

impl Partner {
    pub fn new(cmd: CreatePartner) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            partner_type: cmd.partner_type.as_str().to_string(),
            code: cmd.code,
            name: cmd.name,
            address: cmd.address,
            phone: cmd.phone,
            email: cmd.email,
            tax_id: cmd.tax_id,
            country_id: cmd.country_id,
            credit_limit: cmd.credit_limit,
            balance: 0,
            notes: cmd.notes,
            active: true,
            created_at: now,
            updated_at: now,
        }
    }
}
