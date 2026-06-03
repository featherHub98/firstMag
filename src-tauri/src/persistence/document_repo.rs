use crate::domain::{Document, DocumentLine, DomainError, DomainResult};
use chrono::Utc;
use sqlx::{Row, SqlitePool};

pub async fn list(pool: &SqlitePool, doc_type: Option<&str>) -> DomainResult<Vec<Document>> {
    let rows = if let Some(dt) = doc_type {
        sqlx::query_as::<_, Document>(
            "SELECT * FROM documents WHERE doc_type = ? ORDER BY created_at DESC",
        )
        .bind(&dt)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, Document>("SELECT * FROM documents ORDER BY created_at DESC")
            .fetch_all(pool)
            .await?
    };
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Document> {
    let doc = sqlx::query_as::<_, Document>("SELECT * FROM documents WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Document {id}")))?;
    Ok(doc)
}

pub async fn get_lines(pool: &SqlitePool, document_id: &str) -> DomainResult<Vec<DocumentLine>> {
    let rows = sqlx::query_as::<_, DocumentLine>(
        "SELECT * FROM document_lines WHERE document_id = ? ORDER BY id",
    )
    .bind(&document_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create_with_lines(
    pool: &SqlitePool,
    doc: &Document,
    lines: &[DocumentLine],
) -> DomainResult<()> {
    let mut tx = pool.begin().await?;

    sqlx::query(
        "INSERT INTO documents (id, doc_type, doc_number, status, partner_id, partner_name, total_ht, total_tax, total_ttc, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&doc.id)
    .bind(&doc.doc_type)
    .bind(&doc.doc_number)
    .bind(&doc.status)
    .bind(&doc.partner_id)
    .bind(&doc.partner_name)
    .bind(&doc.total_ht)
    .bind(&doc.total_tax)
    .bind(&doc.total_ttc)
    .bind(&doc.notes)
    .bind(&doc.created_at)
    .bind(&doc.updated_at)
    .execute(&mut *tx)
    .await?;

    for line in lines {
        sqlx::query(
            "INSERT INTO document_lines (id, document_id, article_id, article_name, quantity, unit_price, tax_rate, total_ht, total_ttc)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&line.id)
        .bind(&line.document_id)
        .bind(&line.article_id)
        .bind(&line.article_name)
        .bind(&line.quantity)
        .bind(&line.unit_price)
        .bind(&line.tax_rate)
        .bind(&line.total_ht)
        .bind(&line.total_ttc)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}

pub async fn update_status(pool: &SqlitePool, id: &str, status: &str) -> DomainResult<()> {
    let now = Utc::now();
    let result = sqlx::query("UPDATE documents SET status = ?, updated_at = ? WHERE id = ?")
        .bind(&status)
        .bind(&now)
        .bind(&id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("Document {id}")));
    }
    Ok(())
}

pub async fn get_next_doc_number(pool: &SqlitePool, doc_type: &str) -> DomainResult<String> {
    let row = sqlx::query("SELECT prefix, next_number FROM document_series WHERE doc_type = ?")
        .bind(&doc_type)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Series for {doc_type}")))?;

    let prefix: String = row.get(0);
    let num: i64 = row.get(1);
    let number = format!("{prefix}{num:06}");

    sqlx::query("UPDATE document_series SET next_number = next_number + 1 WHERE doc_type = ?")
        .bind(&doc_type)
        .execute(pool)
        .await?;

    Ok(number)
}


