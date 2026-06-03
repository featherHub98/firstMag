use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct UnitOfMeasure {
    pub id: String,
    pub name: String,
    pub symbol: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUnitOfMeasure {
    pub name: String,
    pub symbol: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUnitOfMeasure {
    pub id: String,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Salesperson {
    pub id: String,
    pub code: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSalesperson {
    pub code: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSalesperson {
    pub id: String,
    pub code: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Depot {
    pub id: String,
    pub code: String,
    pub name: String,
    pub address: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDepot {
    pub code: String,
    pub name: String,
    pub address: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateDepot {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub address: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Bank {
    pub id: String,
    pub code: String,
    pub name: String,
    pub address: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateBank {
    pub code: String,
    pub name: String,
    pub address: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateBank {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub address: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Currency {
    pub id: String,
    pub code: String,
    pub name: String,
    pub symbol: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCurrency {
    pub code: String,
    pub name: String,
    pub symbol: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCurrency {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentMethod {
    pub id: String,
    pub code: String,
    pub name: String,
    pub description: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePaymentMethod {
    pub code: String,
    pub name: String,
    pub description: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePaymentMethod {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Cashier {
    pub id: String,
    pub code: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCashier {
    pub code: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCashier {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Register {
    pub id: String,
    pub code: String,
    pub name: String,
    pub location: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRegister {
    pub code: String,
    pub name: String,
    pub location: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateRegister {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub location: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Rayon {
    pub id: String,
    pub code: String,
    pub name: String,
    pub depot_id: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRayon {
    pub code: String,
    pub name: String,
    pub depot_id: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateRayon {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub depot_id: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Gondola {
    pub id: String,
    pub code: String,
    pub name: String,
    pub depot_id: String,
    pub rayon_id: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateGondola {
    pub code: String,
    pub name: String,
    pub depot_id: String,
    pub rayon_id: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateGondola {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub depot_id: Option<String>,
    pub rayon_id: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ProductRange {
    pub id: String,
    pub code: String,
    pub name: String,
    pub description: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProductRange {
    pub code: String,
    pub name: String,
    pub description: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProductRange {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TariffCategory {
    pub id: String,
    pub code: String,
    pub name: String,
    pub discount_rate: i64,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTariffCategory {
    pub code: String,
    pub name: String,
    pub discount_rate: i64,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTariffCategory {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub discount_rate: Option<i64>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AccountingCategory {
    pub id: String,
    pub code: String,
    pub name: String,
    pub account_number: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAccountingCategory {
    pub code: String,
    pub name: String,
    pub account_number: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateAccountingCategory {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub account_number: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AdvancedTaxRate {
    pub id: String,
    pub code: String,
    pub name: String,
    pub rate: i64,
    pub surcharge_rate: i64,
    pub withholding_rate: i64,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAdvancedTaxRate {
    pub code: String,
    pub name: String,
    pub rate: i64,
    pub surcharge_rate: i64,
    pub withholding_rate: i64,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateAdvancedTaxRate {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub rate: Option<i64>,
    pub surcharge_rate: Option<i64>,
    pub withholding_rate: Option<i64>,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DocumentSeries {
    pub id: String,
    pub doc_type: String,
    pub prefix: String,
    pub next_number: i64,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Country {
    pub id: String,
    pub code: String,
    pub name: String,
    pub iso2: String,
    pub phone_code: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCountry {
    pub code: String,
    pub name: String,
    pub iso2: String,
    pub phone_code: String,
    pub active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCountry {
    pub id: String,
    pub code: Option<String>,
    pub name: Option<String>,
    pub iso2: Option<String>,
    pub phone_code: Option<String>,
    pub active: Option<bool>,
}

impl UnitOfMeasure {
    pub fn new(cmd: CreateUnitOfMeasure) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: cmd.name,
            symbol: cmd.symbol,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Salesperson {
    pub fn new(cmd: CreateSalesperson) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            first_name: cmd.first_name,
            last_name: cmd.last_name,
            email: cmd.email,
            phone: cmd.phone,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn apply_update(&mut self, cmd: UpdateSalesperson) {
        if let Some(v) = cmd.code {
            self.code = v;
        }
        if let Some(v) = cmd.first_name {
            self.first_name = v;
        }
        if let Some(v) = cmd.last_name {
            self.last_name = v;
        }
        if let Some(v) = cmd.email {
            self.email = v;
        }
        if let Some(v) = cmd.phone {
            self.phone = v;
        }
        if let Some(v) = cmd.active {
            self.active = v;
        }
        self.updated_at = Utc::now();
    }
}

impl Depot {
    pub fn new(cmd: CreateDepot) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            address: cmd.address,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Bank {
    pub fn new(cmd: CreateBank) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            address: cmd.address,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Currency {
    pub fn new(cmd: CreateCurrency) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            symbol: cmd.symbol,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl PaymentMethod {
    pub fn new(cmd: CreatePaymentMethod) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            description: cmd.description,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Cashier {
    pub fn new(cmd: CreateCashier) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            email: cmd.email,
            phone: cmd.phone,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Register {
    pub fn new(cmd: CreateRegister) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            location: cmd.location,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Rayon {
    pub fn new(cmd: CreateRayon) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            depot_id: cmd.depot_id,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Gondola {
    pub fn new(cmd: CreateGondola) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            depot_id: cmd.depot_id,
            rayon_id: cmd.rayon_id,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl ProductRange {
    pub fn new(cmd: CreateProductRange) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            description: cmd.description,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl TariffCategory {
    pub fn new(cmd: CreateTariffCategory) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            discount_rate: cmd.discount_rate,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl AccountingCategory {
    pub fn new(cmd: CreateAccountingCategory) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            account_number: cmd.account_number,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl AdvancedTaxRate {
    pub fn new(cmd: CreateAdvancedTaxRate) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            rate: cmd.rate,
            surcharge_rate: cmd.surcharge_rate,
            withholding_rate: cmd.withholding_rate,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Country {
    pub fn new(cmd: CreateCountry) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            code: cmd.code,
            name: cmd.name,
            iso2: cmd.iso2,
            phone_code: cmd.phone_code,
            active: cmd.active.unwrap_or(true),
            created_at: now,
            updated_at: now,
        }
    }
}
