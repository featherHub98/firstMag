use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Article {
    pub id: String,
    pub code: String,
    pub barcode: String,
    pub name: String,
    pub family_id: Option<String>,
    pub sub_family_id: Option<String>,
    pub purchase_price: i64,
    pub sale_price: i64,
    pub tax_rate_id: Option<String>,
    pub unit: String,
    pub image_path: Option<String>,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateArticle {
    pub code: String,
    pub barcode: String,
    pub name: String,
    pub family_id: Option<String>,
    pub sub_family_id: Option<String>,
    pub purchase_price: i64,
    pub sale_price: i64,
    pub tax_rate_id: Option<String>,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateArticle {
    pub id: String,
    pub code: Option<String>,
    pub barcode: Option<String>,
    pub name: Option<String>,
    pub family_id: Option<String>,
    pub sub_family_id: Option<String>,
    pub purchase_price: Option<i64>,
    pub sale_price: Option<i64>,
    pub tax_rate_id: Option<String>,
    pub unit: Option<String>,
    pub active: Option<bool>,
}

impl Article {
    pub fn new(cmd: CreateArticle) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            barcode: cmd.barcode,
            name: cmd.name,
            family_id: cmd.family_id,
            sub_family_id: cmd.sub_family_id,
            purchase_price: cmd.purchase_price,
            sale_price: cmd.sale_price,
            tax_rate_id: cmd.tax_rate_id,
            unit: cmd.unit,
            image_path: None,
            active: true,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn apply_update(&mut self, cmd: UpdateArticle) {
        if let Some(v) = cmd.code { self.code = v; }
        if let Some(v) = cmd.barcode { self.barcode = v; }
        if let Some(v) = cmd.name { self.name = v; }
        if let Some(v) = cmd.family_id { self.family_id = Some(v); }
        if let Some(v) = cmd.sub_family_id { self.sub_family_id = Some(v); }
        if let Some(v) = cmd.purchase_price { self.purchase_price = v; }
        if let Some(v) = cmd.sale_price { self.sale_price = v; }
        if let Some(v) = cmd.tax_rate_id { self.tax_rate_id = Some(v); }
        if let Some(v) = cmd.unit { self.unit = v; }
        if let Some(v) = cmd.active { self.active = v; }
        self.updated_at = Utc::now();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ArticleFamily {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ArticleSubFamily {
    pub id: String,
    pub name: String,
    pub family_id: String,
}
