use crate::domain::{ArticleCode, CreateArticleCode, DomainError, DomainResult};
use sqlx::SqlitePool;

pub async fn list(pool: &SqlitePool, article_id: Option<&str>) -> DomainResult<Vec<ArticleCode>> {
    let rows = if let Some(id) = article_id {
        sqlx::query_as::<_, ArticleCode>(
            "SELECT id, article_id, code, code_type, active, created_at FROM article_codes WHERE article_id = ? ORDER BY code"
        )
        .bind(&id)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, ArticleCode>(
            "SELECT id, article_id, code, code_type, active, created_at FROM article_codes ORDER BY code"
        )
        .fetch_all(pool)
        .await?
    };
    Ok(rows)
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<ArticleCode>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, ArticleCode>(
        "SELECT id, article_id, code, code_type, active, created_at FROM article_codes WHERE code LIKE ? ORDER BY code LIMIT 50"
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateArticleCode) -> DomainResult<ArticleCode> {
    let item = ArticleCode::new(cmd);
    sqlx::query(
        "INSERT INTO article_codes (id, article_id, code, code_type, active, created_at) VALUES (?, ?, ?, ?, 1, ?)"
    )
    .bind(&item.id)
    .bind(&item.article_id)
    .bind(&item.code)
    .bind(&item.code_type)
    .bind(&item.created_at)
    .execute(pool)
    .await?;
    Ok(item)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM article_codes WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("ArticleCode {id}")));
    }
    Ok(())
}


