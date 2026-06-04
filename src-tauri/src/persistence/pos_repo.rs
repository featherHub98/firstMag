use crate::domain::{
    CashMovement, CashMovementSummary, CashSessionTotals, DomainError, DomainResult, PosSession,
    PosTicket,
};
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

async fn ensure_default_pos_refs(pool: &SqlitePool) -> DomainResult<()> {
    sqlx::query(
        "INSERT OR IGNORE INTO cashiers (id, code, name, email, phone, active, created_at, updated_at)
         VALUES ('1', 'CAI001', 'Caissier principal', '', '', 1, datetime('now'), datetime('now'))",
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "INSERT OR IGNORE INTO registers (id, code, name, location, active, created_at, updated_at)
         VALUES ('1', 'REG001', 'Caisse principale', 'Magasin principal', 1, datetime('now'), datetime('now'))",
    )
    .execute(pool)
    .await?;

    Ok(())
}

async fn resolve_register_id(pool: &SqlitePool, requested: &str) -> DomainResult<String> {
    if let Some(id) = sqlx::query_scalar::<_, String>(
        "SELECT id FROM registers WHERE id = ? OR code = ? ORDER BY active DESC LIMIT 1",
    )
    .bind(requested)
    .bind(requested)
    .fetch_optional(pool)
    .await?
    {
        return Ok(id);
    }

    sqlx::query_scalar::<_, String>("SELECT id FROM registers ORDER BY active DESC, code LIMIT 1")
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::InvalidOperation("Caisse introuvable".into()))
}

async fn resolve_cashier_id(pool: &SqlitePool, requested: &str) -> DomainResult<String> {
    if let Some(id) = sqlx::query_scalar::<_, String>(
        "SELECT id FROM cashiers WHERE id = ? OR code = ? ORDER BY active DESC LIMIT 1",
    )
    .bind(requested)
    .bind(requested)
    .fetch_optional(pool)
    .await?
    {
        return Ok(id);
    }

    sqlx::query_scalar::<_, String>("SELECT id FROM cashiers ORDER BY active DESC, code LIMIT 1")
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::InvalidOperation("Caissier introuvable".into()))
}

pub async fn get_open_session(pool: &SqlitePool) -> DomainResult<Option<PosSession>> {
    let session =
        sqlx::query_as::<_, PosSession>("SELECT * FROM pos_sessions WHERE status = 'open' LIMIT 1")
            .fetch_optional(pool)
            .await?;
    Ok(session)
}

pub async fn open_session(
    pool: &SqlitePool,
    register_id: &str,
    cashier_id: &str,
    fund: i64,
) -> DomainResult<PosSession> {
    ensure_default_pos_refs(pool).await?;

    let existing = get_open_session(pool).await?;
    if existing.is_some() {
        return Err(DomainError::InvalidOperation(
            "Une session est déjà ouverte".into(),
        ));
    }
    let resolved_register_id = resolve_register_id(pool, register_id).await?;
    let resolved_cashier_id = resolve_cashier_id(pool, cashier_id).await?;

    let session = PosSession::open(&resolved_register_id, &resolved_cashier_id, fund);
    sqlx::query(
        "INSERT INTO pos_sessions (id, register_id, cashier_id, opening_fund, status, ticket_count, total_sales, opened_at)
         VALUES (?, ?, ?, ?, 'open', 0, 0, ?)"
    )
    .bind(&session.id)
    .bind(&session.register_id)
    .bind(&session.cashier_id)
    .bind(&session.opening_fund)
    .bind(&session.opened_at)
    .execute(pool)
    .await?;
    Ok(session)
}

pub async fn close_session(
    pool: &SqlitePool,
    session_id: &str,
    closing_fund: i64,
) -> DomainResult<PosSession> {
    let session = sqlx::query_as::<_, PosSession>("SELECT * FROM pos_sessions WHERE id = ?")
        .bind(&session_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound("Session".into()))?;

    if session.status != "open" {
        return Err(DomainError::InvalidOperation("Session déjà fermée".into()));
    }

    let now = Utc::now();
    sqlx::query(
        "UPDATE pos_sessions SET status = 'closed', closing_fund = ?, closed_at = ? WHERE id = ?",
    )
    .bind(&closing_fund)
    .bind(&now)
    .bind(&session_id)
    .execute(pool)
    .await?;

    let mut closed = session;
    closed.status = "closed".into();
    closed.closing_fund = Some(closing_fund);
    closed.closed_at = Some(Utc::now());
    Ok(closed)
}

pub async fn create_ticket(pool: &SqlitePool, session_id: &str) -> DomainResult<PosTicket> {
    let session = get_open_session(pool)
        .await?
        .ok_or_else(|| DomainError::InvalidOperation("Aucune session ouverte".into()))?;
    if session.id != session_id {
        return Err(DomainError::InvalidOperation("Session invalide".into()));
    }

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
    .bind(&ticket.ticket_number)
    .bind(&ticket.created_at)
    .execute(pool)
    .await?;

    sqlx::query("UPDATE pos_sessions SET ticket_count = ticket_count + 1 WHERE id = ?")
        .bind(&session_id)
        .execute(pool)
        .await?;

    Ok(ticket)
}

pub async fn get_active_ticket(
    pool: &SqlitePool,
    _session_id: &str,
) -> DomainResult<Option<PosTicket>> {
    let ticket = sqlx::query_as::<_, PosTicket>(
        "SELECT * FROM pos_tickets WHERE session_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
    )
    .bind(&_session_id)
    .fetch_optional(pool)
    .await?;
    Ok(ticket)
}

pub async fn list_cash_movements(
    pool: &SqlitePool,
    session_id: &str,
) -> DomainResult<Vec<CashMovement>> {
    let rows = sqlx::query_as::<_, CashMovement>(
        "SELECT id, session_id, movement_type, amount, description, user_id, user_name, created_at
         FROM cash_movements
         WHERE session_id = ?
         ORDER BY created_at DESC",
    )
    .bind(&session_id)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn add_cash_movement(
    pool: &SqlitePool,
    session_id: &str,
    movement_type: &str,
    amount: i64,
    description: &str,
    user_id: &str,
    user_name: &str,
) -> DomainResult<CashMovement> {
    if amount <= 0 {
        return Err(DomainError::InvalidOperation("Montant invalide".into()));
    }

    if movement_type != "in" && movement_type != "out" {
        return Err(DomainError::InvalidOperation(
            "Type de mouvement invalide".into(),
        ));
    }

    let session = sqlx::query_as::<_, PosSession>("SELECT * FROM pos_sessions WHERE id = ?")
        .bind(&session_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound("Session".into()))?;

    if session.status != "open" {
        return Err(DomainError::InvalidOperation("Session fermée".into()));
    }

    let created_at = Utc::now();
    let movement = CashMovement {
        id: Uuid::new_v4().to_string(),
        session_id: session_id.to_string(),
        movement_type: movement_type.to_string(),
        amount,
        description: description.to_string(),
        user_id: user_id.to_string(),
        user_name: user_name.to_string(),
        created_at,
    };

    sqlx::query(
        "INSERT INTO cash_movements
        (id, session_id, movement_type, amount, description, user_id, user_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&movement.id)
    .bind(&movement.session_id)
    .bind(&movement.movement_type)
    .bind(&movement.amount)
    .bind(&movement.description)
    .bind(&movement.user_id)
    .bind(&movement.user_name)
    .bind(&movement.created_at)
    .execute(pool)
    .await?;

    Ok(movement)
}

pub async fn get_session_cash_summary(
    pool: &SqlitePool,
    session_id: &str,
) -> DomainResult<CashMovementSummary> {
    let session = sqlx::query_as::<_, PosSession>("SELECT * FROM pos_sessions WHERE id = ?")
        .bind(&session_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound("Session".into()))?;

    let (total_in, total_out) = sqlx::query_as::<_, (i64, i64)>(
        "SELECT
            COALESCE(SUM(CASE WHEN movement_type = 'in' THEN amount ELSE 0 END), 0) AS total_in,
            COALESCE(SUM(CASE WHEN movement_type = 'out' THEN amount ELSE 0 END), 0) AS total_out
         FROM cash_movements
         WHERE session_id = ?",
    )
    .bind(&session_id)
    .fetch_one(pool)
    .await?;

    Ok(CashMovementSummary {
        opening_fund: session.opening_fund,
        total_in,
        total_out,
        current_cash: session.opening_fund + total_in - total_out,
    })
}

pub async fn list_session_cash_totals(
    pool: &SqlitePool,
    date_from: Option<&str>,
    date_to: Option<&str>,
) -> DomainResult<Vec<CashSessionTotals>> {
    let rows = sqlx::query_as::<_, CashSessionTotals>(
        "SELECT
            ps.id AS session_id,
            ps.register_id,
            ps.cashier_id,
            ps.status,
            ps.opening_fund,
            ps.closing_fund,
            COALESCE(SUM(CASE WHEN cm.movement_type = 'in' THEN cm.amount ELSE 0 END), 0) AS total_in,
            COALESCE(SUM(CASE WHEN cm.movement_type = 'out' THEN cm.amount ELSE 0 END), 0) AS total_out,
            ps.opening_fund
              + COALESCE(SUM(CASE WHEN cm.movement_type = 'in' THEN cm.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN cm.movement_type = 'out' THEN cm.amount ELSE 0 END), 0) AS theoretical_closing,
            CASE
              WHEN ps.closing_fund IS NULL THEN 0
              ELSE ps.closing_fund - (
                ps.opening_fund
                  + COALESCE(SUM(CASE WHEN cm.movement_type = 'in' THEN cm.amount ELSE 0 END), 0)
                  - COALESCE(SUM(CASE WHEN cm.movement_type = 'out' THEN cm.amount ELSE 0 END), 0)
              )
            END AS variance,
            ps.opened_at,
            ps.closed_at
         FROM pos_sessions ps
         LEFT JOIN cash_movements cm ON cm.session_id = ps.id
         WHERE (? IS NULL OR date(ps.opened_at) >= date(?))
           AND (? IS NULL OR date(ps.opened_at) <= date(?))
         GROUP BY ps.id
         ORDER BY ps.opened_at DESC",
    )
    .bind(&date_from)
    .bind(&date_from)
    .bind(&date_to)
    .bind(&date_to)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}


