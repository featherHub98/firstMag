use sqlx::SqlitePool;
use crate::domain::{PosSession, PosTicket, DomainResult, DomainError};
use chrono::Utc;
use uuid::Uuid;

pub async fn get_open_session(pool: &SqlitePool) -> DomainResult<Option<PosSession>> {
    let session = sqlx::query_as::<_, PosSession>(
        "SELECT * FROM pos_sessions WHERE status = 'open' LIMIT 1"
    )
    .fetch_optional(pool)
    .await?;
    Ok(session)
}

pub async fn open_session(pool: &SqlitePool, cashier_id: &str, fund: i64) -> DomainResult<PosSession> {
    let existing = get_open_session(pool).await?;
    if existing.is_some() {
        return Err(DomainError::InvalidOperation("Une session est déjà ouverte".into()));
    }
    let session = PosSession::open("1", cashier_id, fund);
    sqlx::query(
        "INSERT INTO pos_sessions (id, register_id, cashier_id, opening_fund, status, ticket_count, total_sales, opened_at)
         VALUES (?, ?, ?, ?, 'open', 0, 0, ?)"
    )
    .bind(&session.id)
    .bind(&session.register_id)
    .bind(&session.cashier_id)
    .bind(session.opening_fund)
    .bind(&session.opened_at)
    .execute(pool)
    .await?;
    Ok(session)
}

pub async fn close_session(pool: &SqlitePool, session_id: &str, closing_fund: i64) -> DomainResult<PosSession> {
    let session = sqlx::query_as::<_, PosSession>(
        "SELECT * FROM pos_sessions WHERE id = ?"
    )
    .bind(session_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| DomainError::NotFound("Session".into()))?;

    if session.status != "open" {
        return Err(DomainError::InvalidOperation("Session déjà fermée".into()));
    }

    let now = Utc::now();
    sqlx::query(
        "UPDATE pos_sessions SET status = 'closed', closing_fund = ?, closed_at = ? WHERE id = ?"
    )
    .bind(closing_fund)
    .bind(&now)
    .bind(session_id)
    .execute(pool)
    .await?;

    let mut closed = session;
    closed.status = "closed".into();
    closed.closing_fund = Some(closing_fund);
    closed.closed_at = Some(Utc::now());
    Ok(closed)
}

pub async fn create_ticket(pool: &SqlitePool, session_id: &str) -> DomainResult<PosTicket> {
    let session = get_open_session(pool).await?
        .ok_or_else(|| DomainError::InvalidOperation("Aucune session ouverte".into()))?;

    let next_num = session.ticket_count + 1;
    let now = Utc::now();
    let ticket = PosTicket {
        id: Uuid::new_v4().to_string(),
        session_id: session_id.to_string(),
        ticket_number: next_num,
        status: "active".into(),
        total_ht: 0,
        total_tax: 0,
        total_ttc: 0,
        payment_status: "pending".into(),
        created_at: now,
    };

    sqlx::query(
        "INSERT INTO pos_tickets (id, session_id, ticket_number, status, total_ht, total_tax, total_ttc, payment_status, created_at)
         VALUES (?, ?, ?, 'active', 0, 0, 0, 'pending', ?)"
    )
    .bind(&ticket.id)
    .bind(&ticket.session_id)
    .bind(ticket.ticket_number)
    .bind(&ticket.created_at)
    .execute(pool)
    .await?;

    sqlx::query("UPDATE pos_sessions SET ticket_count = ticket_count + 1 WHERE id = ?")
        .bind(session_id)
        .execute(pool)
        .await?;

    Ok(ticket)
}

pub async fn get_active_ticket(pool: &SqlitePool, _session_id: &str) -> DomainResult<Option<PosTicket>> {
    let ticket = sqlx::query_as::<_, PosTicket>(
        "SELECT * FROM pos_tickets WHERE session_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
    )
    .bind(_session_id)
    .fetch_optional(pool)
    .await?;
    Ok(ticket)
}
