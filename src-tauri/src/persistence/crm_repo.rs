use crate::domain::{
    CreatePartnerFollowUp, CreatePartnerReclamation, DomainError, DomainResult, PartnerFollowUp,
    PartnerKpis, PartnerProfile, PartnerReclamation, UpdatePartnerFollowUpStatus,
    UpdatePartnerReclamationStatus, UpsertPartnerProfile,
};
use chrono::Utc;
use sqlx::{Row, SqlitePool};

pub async fn get_profile(pool: &SqlitePool, partner_id: &str) -> DomainResult<PartnerProfile> {
    if let Some(profile) = sqlx::query_as::<_, PartnerProfile>(
        "SELECT * FROM partner_profiles WHERE partner_id = ?",
    )
    .bind(&partner_id)
    .fetch_optional(pool)
    .await?
    {
        return Ok(profile);
    }

    let now = Utc::now();
    sqlx::query(
        "INSERT INTO partner_profiles (
            partner_id, fiscal_address, commercial_contact, payment_model, shipping_address,
            currency_code, credit_control_enabled, loyalty_barcode, family_segment, milestone_tier,
            deferred_discount_rate, global_discount_millimes, allow_deferred_payment, deposit_balance,
            last_visit_at, notes_ext, created_at, updated_at
        ) VALUES (?, '', '', '', '', 'TND', 0, '', '', '', 0, 0, 0, 0, NULL, '', ?, ?)",
    )
    .bind(&partner_id)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    sqlx::query_as::<_, PartnerProfile>("SELECT * FROM partner_profiles WHERE partner_id = ?")
        .bind(&partner_id)
        .fetch_one(pool)
        .await
        .map_err(Into::into)
}

pub async fn upsert_profile(pool: &SqlitePool, cmd: UpsertPartnerProfile) -> DomainResult<PartnerProfile> {
    let now = Utc::now();
    sqlx::query(
        "INSERT INTO partner_profiles (
            partner_id, fiscal_address, commercial_contact, payment_model, shipping_address, currency_code,
            credit_control_enabled, loyalty_barcode, family_segment, milestone_tier, deferred_discount_rate,
            global_discount_millimes, allow_deferred_payment, deposit_balance, last_visit_at, notes_ext, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(partner_id) DO UPDATE SET
            fiscal_address=excluded.fiscal_address,
            commercial_contact=excluded.commercial_contact,
            payment_model=excluded.payment_model,
            shipping_address=excluded.shipping_address,
            currency_code=excluded.currency_code,
            credit_control_enabled=excluded.credit_control_enabled,
            loyalty_barcode=excluded.loyalty_barcode,
            family_segment=excluded.family_segment,
            milestone_tier=excluded.milestone_tier,
            deferred_discount_rate=excluded.deferred_discount_rate,
            global_discount_millimes=excluded.global_discount_millimes,
            allow_deferred_payment=excluded.allow_deferred_payment,
            deposit_balance=excluded.deposit_balance,
            last_visit_at=excluded.last_visit_at,
            notes_ext=excluded.notes_ext,
            updated_at=excluded.updated_at",
    )
    .bind(&cmd.partner_id)
    .bind(&cmd.fiscal_address)
    .bind(&cmd.commercial_contact)
    .bind(&cmd.payment_model)
    .bind(&cmd.shipping_address)
    .bind(&cmd.currency_code)
    .bind(&cmd.credit_control_enabled)
    .bind(&cmd.loyalty_barcode)
    .bind(&cmd.family_segment)
    .bind(&cmd.milestone_tier)
    .bind(&cmd.deferred_discount_rate)
    .bind(&cmd.global_discount_millimes)
    .bind(&cmd.allow_deferred_payment)
    .bind(&cmd.deposit_balance)
    .bind(&cmd.last_visit_at)
    .bind(&cmd.notes_ext)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    get_profile(pool, &cmd.partner_id).await
}

pub async fn get_partner_kpis(pool: &SqlitePool, partner_id: &str) -> DomainResult<PartnerKpis> {
    let yearly_total_ttc: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total_ttc), 0) FROM documents
         WHERE partner_id = ? AND doc_type = 'invoice' AND created_at >= datetime('now','start of year')",
    )
    .bind(&partner_id)
    .fetch_one(pool)
    .await?;

    let monthly_total_ttc: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total_ttc), 0) FROM documents
         WHERE partner_id = ? AND doc_type = 'invoice' AND created_at >= datetime('now','start of month')",
    )
    .bind(&partner_id)
    .fetch_one(pool)
    .await?;

    let yearly_invoice_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM documents
         WHERE partner_id = ? AND doc_type = 'invoice' AND created_at >= datetime('now','start of year')",
    )
    .bind(&partner_id)
    .fetch_one(pool)
    .await?;

    let last_invoice_at = sqlx::query_scalar::<_, chrono::DateTime<chrono::Utc>>(
        "SELECT MAX(created_at) FROM documents WHERE partner_id = ? AND doc_type = 'invoice'",
    )
    .bind(&partner_id)
    .fetch_optional(pool)
    .await?;

    let last_purchase_at = sqlx::query_scalar::<_, chrono::DateTime<chrono::Utc>>(
        "SELECT MAX(created_at) FROM documents WHERE partner_id = ? AND doc_type IN ('invoice','order','delivery')",
    )
    .bind(&partner_id)
    .fetch_optional(pool)
    .await?;

    let outstanding_balance: i64 =
        sqlx::query_scalar("SELECT COALESCE(balance, 0) FROM partners WHERE id = ?")
            .bind(&partner_id)
            .fetch_optional(pool)
            .await?
            .unwrap_or(0);

    let pending_followups: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM partner_followups WHERE partner_id = ? AND status = 'pending'",
    )
    .bind(&partner_id)
    .fetch_one(pool)
    .await?;

    let open_reclamations: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM partner_reclamations WHERE partner_id = ? AND status IN ('open', 'in_progress')",
    )
    .bind(&partner_id)
    .fetch_one(pool)
    .await?;

    Ok(PartnerKpis {
        partner_id: partner_id.to_string(),
        yearly_total_ttc,
        monthly_total_ttc,
        yearly_invoice_count,
        last_invoice_at,
        last_purchase_at,
        outstanding_balance,
        pending_followups,
        open_reclamations,
    })
}

pub async fn list_followups(pool: &SqlitePool, partner_id: &str) -> DomainResult<Vec<PartnerFollowUp>> {
    sqlx::query_as::<_, PartnerFollowUp>(
        "SELECT * FROM partner_followups WHERE partner_id = ? ORDER BY created_at DESC",
    )
    .bind(&partner_id)
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

pub async fn create_followup(pool: &SqlitePool, cmd: CreatePartnerFollowUp) -> DomainResult<PartnerFollowUp> {
    let item = PartnerFollowUp::new(cmd);
    sqlx::query(
        "INSERT INTO partner_followups (id, partner_id, subject, due_date, status, priority, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&item.id)
    .bind(&item.partner_id)
    .bind(&item.subject)
    .bind(&item.due_date)
    .bind(&item.status)
    .bind(&item.priority)
    .bind(&item.notes)
    .bind(&item.created_at)
    .bind(&item.updated_at)
    .execute(pool)
    .await?;
    Ok(item)
}

pub async fn update_followup_status(
    pool: &SqlitePool,
    cmd: UpdatePartnerFollowUpStatus,
) -> DomainResult<PartnerFollowUp> {
    let now = Utc::now();
    let result = sqlx::query("UPDATE partner_followups SET status = ?, updated_at = ? WHERE id = ?")
        .bind(&cmd.status)
        .bind(&now)
        .bind(&cmd.id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("PartnerFollowUp {}", cmd.id)));
    }
    sqlx::query_as::<_, PartnerFollowUp>("SELECT * FROM partner_followups WHERE id = ?")
        .bind(&cmd.id)
        .fetch_one(pool)
        .await
        .map_err(Into::into)
}

pub async fn list_reclamations(
    pool: &SqlitePool,
    partner_id: Option<&str>,
) -> DomainResult<Vec<PartnerReclamation>> {
    let rows = if let Some(pid) = partner_id {
        sqlx::query_as::<_, PartnerReclamation>(
            "SELECT * FROM partner_reclamations WHERE partner_id = ? ORDER BY created_at DESC",
        )
        .bind(&pid)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, PartnerReclamation>(
            "SELECT * FROM partner_reclamations ORDER BY created_at DESC LIMIT 500",
        )
        .fetch_all(pool)
        .await?
    };
    Ok(rows)
}

pub async fn create_reclamation(
    pool: &SqlitePool,
    cmd: CreatePartnerReclamation,
) -> DomainResult<PartnerReclamation> {
    let item = PartnerReclamation::new(cmd);
    sqlx::query(
        "INSERT INTO partner_reclamations (id, partner_id, title, description, status, severity, source, created_at, updated_at, resolved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)",
    )
    .bind(&item.id)
    .bind(&item.partner_id)
    .bind(&item.title)
    .bind(&item.description)
    .bind(&item.status)
    .bind(&item.severity)
    .bind(&item.source)
    .bind(&item.created_at)
    .bind(&item.updated_at)
    .execute(pool)
    .await?;
    Ok(item)
}

pub async fn update_reclamation_status(
    pool: &SqlitePool,
    cmd: UpdatePartnerReclamationStatus,
) -> DomainResult<PartnerReclamation> {
    let now = Utc::now();
    let resolved_at = if cmd.status == "resolved" || cmd.status == "closed" {
        Some(now)
    } else {
        None
    };
    let result = sqlx::query(
        "UPDATE partner_reclamations SET status = ?, updated_at = ?, resolved_at = ? WHERE id = ?",
    )
    .bind(&cmd.status)
    .bind(&now)
    .bind(&resolved_at)
    .bind(&cmd.id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(DomainError::NotFound(format!("PartnerReclamation {}", cmd.id)));
    }
    sqlx::query_as::<_, PartnerReclamation>("SELECT * FROM partner_reclamations WHERE id = ?")
        .bind(&cmd.id)
        .fetch_one(pool)
        .await
        .map_err(Into::into)
}

pub async fn find_partner_by_loyalty_barcode(
    pool: &SqlitePool,
    barcode: &str,
) -> DomainResult<Option<String>> {
    let row = sqlx::query("SELECT partner_id FROM partner_profiles WHERE loyalty_barcode = ?")
        .bind(&barcode)
        .fetch_optional(pool)
        .await?;
    Ok(row.map(|r| r.get::<String, _>(0)))
}


