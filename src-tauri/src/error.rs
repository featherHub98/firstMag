use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AppError {
    pub message: String,
}

impl From<String> for AppError {
    fn from(message: String) -> Self {
        Self { message }
    }
}
