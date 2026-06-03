use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::domain::{
    ArticleFamily, CreateArticleFamily, DomainError, DomainResult, UpdateArticleFamily,
};

const FAMILY_UNION_SELECT: &str = "
    SELECT
        id,
        name,
        parent_id,
        CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END AS level,
        1 AS active,
        datetime('now') AS created_at,
        datetime('now') AS updated_at
    FROM article_families
    UNION ALL
    SELECT
        id,
        name,
        family_id AS parent_id,
        1 AS level,
        1 AS active,
        datetime('now') AS created_at,
        datetime('now') AS updated_at
    FROM article_sub_families
";

pub async fn list(pool: &SqlitePool) -> DomainResult<Vec<ArticleFamily>> {
    let rows = sqlx::query_as::<_, ArticleFamily>(&format!(
        "SELECT * FROM ({FAMILY_UNION_SELECT}) ORDER BY level, name"
    ))
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<ArticleFamily> {
    sqlx::query_as::<_, ArticleFamily>(&format!(
        "SELECT * FROM ({FAMILY_UNION_SELECT}) WHERE id = ?"
    ))
    .bind(&id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| DomainError::NotFound(format!("Article family {id}")))
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<ArticleFamily>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, ArticleFamily>(&format!(
        "SELECT * FROM ({FAMILY_UNION_SELECT}) WHERE name LIKE ? ORDER BY level, name LIMIT 50"
    ))
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create(pool: &SqlitePool, cmd: CreateArticleFamily) -> DomainResult<ArticleFamily> {
    let id = Uuid::new_v4().to_string();
    if let Some(parent_id) = cmd.parent_id.as_deref().filter(|v| !v.is_empty()) {
        sqlx::query("INSERT INTO article_sub_families (id, name, family_id) VALUES (?, ?, ?)")
            .bind(&id)
            .bind(&cmd.name)
            .bind(&parent_id)
            .execute(pool)
            .await?;
    } else {
        sqlx::query("INSERT INTO article_families (id, name, parent_id) VALUES (?, ?, NULL)")
            .bind(&id)
            .bind(&cmd.name)
            .execute(pool)
            .await?;
    }
    get_by_id(pool, &id).await
}

pub async fn update(pool: &SqlitePool, cmd: UpdateArticleFamily) -> DomainResult<ArticleFamily> {
    let existing = get_by_id(pool, &cmd.id).await?;
    let name = cmd.name.unwrap_or(existing.name);
    let parent_id = cmd.parent_id.or(existing.parent_id);

    if existing.level == 0 && parent_id.is_none() {
        sqlx::query("UPDATE article_families SET name = ?, parent_id = NULL WHERE id = ?")
            .bind(&name)
            .bind(&cmd.id)
            .execute(pool)
            .await?;
    } else if existing.level == 0 {
        let parent = parent_id.ok_or_else(|| {
            DomainError::Validation("Parent family is required for sub-family".into())
        })?;
        sqlx::query("DELETE FROM article_families WHERE id = ?")
            .bind(&cmd.id)
            .execute(pool)
            .await?;
        sqlx::query("INSERT INTO article_sub_families (id, name, family_id) VALUES (?, ?, ?)")
            .bind(&cmd.id)
            .bind(&name)
            .bind(&parent)
            .execute(pool)
            .await?;
    } else if let Some(parent) = parent_id {
        sqlx::query("UPDATE article_sub_families SET name = ?, family_id = ? WHERE id = ?")
            .bind(&name)
            .bind(&parent)
            .bind(&cmd.id)
            .execute(pool)
            .await?;
    } else {
        sqlx::query("DELETE FROM article_sub_families WHERE id = ?")
            .bind(&cmd.id)
            .execute(pool)
            .await?;
        sqlx::query("INSERT INTO article_families (id, name, parent_id) VALUES (?, ?, NULL)")
            .bind(&cmd.id)
            .bind(&name)
            .execute(pool)
            .await?;
    }

    let mut updated = get_by_id(pool, &cmd.id).await?;
    updated.updated_at = Utc::now();
    Ok(updated)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> DomainResult<()> {
    let sub_result = sqlx::query("DELETE FROM article_sub_families WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if sub_result.rows_affected() > 0 {
        return Ok(());
    }

    let family_result = sqlx::query("DELETE FROM article_families WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await?;
    if family_result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Article family {id}")));
    }
    Ok(())
}


