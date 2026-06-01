use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Duplicate entry: {0}")]
    Duplicate(String),

    #[error("Invalid operation: {0}")]
    InvalidOperation(String),

    #[error("Persistence error: {0}")]
    Persistence(#[from] sqlx::Error),
}

pub type DomainResult<T> = Result<T, DomainError>;
