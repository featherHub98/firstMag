use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxRate {
    pub id: String,
    pub name: String,
    pub rate: i64,
    pub active: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tax_rate_apply() {
        let t = TaxRate::new("TVA 19%", 19);
        assert_eq!(t.apply(1000), 190);
        assert_eq!(t.apply(0), 0);
    }

    #[test]
    fn test_tax_rate_apply_float() {
        let t = TaxRate::new("TVA 19%", 19);
        assert!((t.apply_float(1000.0) - 190.0).abs() < 0.001);
    }

    #[test]
    fn test_tax_rate_zero() {
        let t = TaxRate::new("TVA 0%", 0);
        assert_eq!(t.apply(5000), 0);
    }
}

impl TaxRate {
    pub fn new(name: &str, rate: i64) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            rate,
            active: true,
        }
    }

    pub fn apply(&self, amount_ht: i64) -> i64 {
        amount_ht * self.rate / 100
    }

    pub fn apply_float(&self, amount_ht: f64) -> f64 {
        amount_ht * self.rate as f64 / 100.0
    }
}
