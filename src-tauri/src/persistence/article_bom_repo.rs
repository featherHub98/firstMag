use crate::domain::{
    ArticleBomHeader, ArticleBomLine, CreateArticleBomHeader, CreateArticleBomLine, DomainError,
    DomainResult,
};
use chrono::Utc;
use sqlx::SqlitePool;

pub async fn list_headers(
    pool: &SqlitePool,
    parent_article_id: Option<&str>,
) -> DomainResult<Vec<ArticleBomHeader>> {
    let rows = if let Some(parent_id) = parent_article_id {
        sqlx::query_as::<_, ArticleBomHeader>(
            "SELECT id, parent_article_id, name, output_quantity, active, created_at, updated_at
             FROM article_bom_headers
             WHERE parent_article_id = ?
             ORDER BY created_at DESC",
        )
        .bind(&parent_id)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, ArticleBomHeader>(
            "SELECT id, parent_article_id, name, output_quantity, active, created_at, updated_at
             FROM article_bom_headers
             ORDER BY created_at DESC",
        )
        .fetch_all(pool)
        .await?
    };
    Ok(rows)
}

pub async fn get_header_by_id(pool: &SqlitePool, id: &str) -> DomainResult<ArticleBomHeader> {
    sqlx::query_as::<_, ArticleBomHeader>(
        "SELECT id, parent_article_id, name, output_quantity, active, created_at, updated_at
         FROM article_bom_headers WHERE id = ?",
    )
    .bind(&id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| DomainError::NotFound(format!("ArticleBomHeader {id}")))
}

pub async fn create_header(
    pool: &SqlitePool,
    cmd: CreateArticleBomHeader,
) -> DomainResult<ArticleBomHeader> {
    let item = ArticleBomHeader::new(cmd);
    sqlx::query(
        "INSERT INTO article_bom_headers (id, parent_article_id, name, output_quantity, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)",
    )
    .bind(&item.id)
    .bind(&item.parent_article_id)
    .bind(&item.name)
    .bind(&item.output_quantity)
    .bind(&item.created_at)
    .bind(&item.updated_at)
    .execute(pool)
    .await?;
    Ok(item)
}

pub async fn set_header_active(pool: &SqlitePool, id: &str, active: bool) -> DomainResult<()> {
    let result = sqlx::query("UPDATE article_bom_headers SET active=?, updated_at=? WHERE id=?")
        .bind(&active)
        .bind(&Utc::now())
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("ArticleBomHeader {id}")));
    }
    Ok(())
}

pub async fn list_lines(pool: &SqlitePool, bom_id: &str) -> DomainResult<Vec<ArticleBomLine>> {
    let rows = sqlx::query_as::<_, ArticleBomLine>(
        "SELECT id, bom_id, component_article_id, quantity, created_at
         FROM article_bom_lines
         WHERE bom_id = ?
         ORDER BY created_at ASC",
    )
    .bind(&bom_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create_line(pool: &SqlitePool, cmd: CreateArticleBomLine) -> DomainResult<ArticleBomLine> {
    let item = ArticleBomLine::new(cmd);
    sqlx::query(
        "INSERT INTO article_bom_lines (id, bom_id, component_article_id, quantity, created_at)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&item.id)
    .bind(&item.bom_id)
    .bind(&item.component_article_id)
    .bind(&item.quantity)
    .bind(&item.created_at)
    .execute(pool)
    .await?;
    Ok(item)
}

pub async fn delete_line(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let result = sqlx::query("DELETE FROM article_bom_lines WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("ArticleBomLine {id}")));
    }
    Ok(())
}


