use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MovementType {
    #[serde(rename = "entry", alias = "Entry")]
    Entry,
    #[serde(rename = "exit", alias = "Exit")]
    Exit,
    #[serde(rename = "transfer", alias = "Transfer")]
    Transfer,
    #[serde(rename = "inventory", alias = "Inventory")]
    Inventory,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::from_str;

    #[test]
    fn test_movement_type_from_str() {
        assert_eq!(MovementType::from_str("entry"), Some(MovementType::Entry));
        assert_eq!(MovementType::from_str("exit"), Some(MovementType::Exit));
        assert_eq!(
            MovementType::from_str("transfer"),
            Some(MovementType::Transfer)
        );
        assert_eq!(
            MovementType::from_str("inventory"),
            Some(MovementType::Inventory)
        );
        assert_eq!(MovementType::from_str("bad"), None);
    }

    #[test]
    fn test_movement_type_as_str() {
        assert_eq!(MovementType::Entry.as_str(), "entry");
        assert_eq!(MovementType::Exit.as_str(), "exit");
        assert_eq!(MovementType::Transfer.as_str(), "transfer");
        assert_eq!(MovementType::Inventory.as_str(), "inventory");
    }

    #[test]
    fn test_movement_type_serde_accepts_lowercase() {
        assert_eq!(from_str::<MovementType>("\"entry\"").ok(), Some(MovementType::Entry));
        assert_eq!(
            from_str::<MovementType>("\"inventory\"").ok(),
            Some(MovementType::Inventory)
        );
    }

    #[test]
    fn test_movement_type_serde_accepts_pascal_case() {
        assert_eq!(from_str::<MovementType>("\"Entry\"").ok(), Some(MovementType::Entry));
        assert_eq!(
            from_str::<MovementType>("\"Inventory\"").ok(),
            Some(MovementType::Inventory)
        );
    }
}

impl MovementType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Entry => "entry",
            Self::Exit => "exit",
            Self::Transfer => "transfer",
            Self::Inventory => "inventory",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "entry" => Some(Self::Entry),
            "exit" => Some(Self::Exit),
            "transfer" => Some(Self::Transfer),
            "inventory" => Some(Self::Inventory),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StockLevel {
    pub article_id: String,
    pub depot_id: String,
    pub quantity: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StockMovement {
    pub id: String,
    pub movement_type: String,
    pub article_id: String,
    pub depot_id: String,
    pub target_depot_id: Option<String>,
    pub quantity: i64,
    pub reference: String,
    pub notes: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StockReport {
    pub date: String,
    pub depot_id: String,
    pub article_id: String,
    pub initial_quantity: i64,
    pub entries_quantity: i64,
    pub exits_quantity: i64,
    pub final_quantity: i64,
    pub variance: i64,
}

impl StockLevel {
    pub fn new(article_id: &str, depot_id: &str, quantity: i64) -> Self {
        Self {
            article_id: article_id.to_string(),
            depot_id: depot_id.to_string(),
            quantity,
        }
    }
}
