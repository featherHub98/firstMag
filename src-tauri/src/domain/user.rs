use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub code: String,
    pub name: String,
    pub role: String,
    pub active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: String,
    pub name: String,
    pub permissions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResult {
    pub id: String,
    pub code: String,
    pub name: String,
    pub role: String,
    pub permissions: Vec<String>,
}

impl User {
    pub fn new(code: &str, name: &str, role: &str) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            code: code.to_string(),
            name: name.to_string(),
            role: role.to_string(),
            active: true,
        }
    }
}
