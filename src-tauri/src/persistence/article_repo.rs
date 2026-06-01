use sqlx::SqlitePool;
use crate::domain::{Article, CreateArticle, UpdateArticle, DomainResult, DomainError};

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<Article>> {
    let rows = sqlx::query_as::<_, Article>("SELECT * FROM articles ORDER BY name")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Article> {
    sqlx::query_as::<_, Article>("SELECT * FROM articles WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Article {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Article>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Article>(
        "SELECT * FROM articles WHERE name LIKE ?1 OR barcode LIKE ?1 OR code LIKE ?1 ORDER BY name LIMIT 50"
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateArticle) -> DomainResult<Article> {
    let article = Article::new(cmd);
    sqlx::query(
        "INSERT INTO articles (id, code, barcode, name, family_id, sub_family_id, purchase_price, sale_price, tax_rate_id, unit, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)"
    )
    .bind(&article.id)
    .bind(&article.code)
    .bind(&article.barcode)
    .bind(&article.name)
    .bind(&article.family_id)
    .bind(&article.sub_family_id)
    .bind(article.purchase_price)
    .bind(article.sale_price)
    .bind(&article.tax_rate_id)
    .bind(&article.unit)
    .bind(&article.created_at)
    .bind(&article.updated_at)
    .execute(pool)
    .await?;
    Ok(article)
}

pub async fn update(pool: &SqlitePool, cmd: UpdateArticle) -> DomainResult<Article> {
    let mut article = get_by_id(pool, &cmd.id).await?;
    article.apply_update(cmd);
    sqlx::query(
        "UPDATE articles SET code=?, barcode=?, name=?, family_id=?, sub_family_id=?, purchase_price=?, sale_price=?, tax_rate_id=?, unit=?, active=?, updated_at=? WHERE id=?"
    )
    .bind(&article.code)
    .bind(&article.barcode)
    .bind(&article.name)
    .bind(&article.family_id)
    .bind(&article.sub_family_id)
    .bind(article.purchase_price)
    .bind(article.sale_price)
    .bind(&article.tax_rate_id)
    .bind(&article.unit)
    .bind(article.active)
    .bind(&article.updated_at)
    .bind(&article.id)
    .execute(pool)
    .await?;
    Ok(article)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM articles WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Article {id}")));
    }
    Ok(())
}
