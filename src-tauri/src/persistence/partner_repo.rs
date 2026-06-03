use crate::domain::{CreatePartner, DomainError, DomainResult, Partner};
use sqlx::SqlitePool;

pub async fn list(pool: &SqlitePool, partner_type: Option<&str>) -> DomainResult<Vec<Partner>> {
    let rows = if let Some(pt) = partner_type {
        sqlx::query_as::<_, Partner>("SELECT * FROM partners WHERE partner_type = ? ORDER BY name")
            .bind(&pt)
            .fetch_all(pool)
            .await?
    } else {
        sqlx::query_as::<_, Partner>("SELECT * FROM partners ORDER BY name")
            .fetch_all(pool)
            .await?
    };
    Ok(rows)
}

pub async fn get_by_id(pool: &SqlitePool, id: &str) -> DomainResult<Partner> {
    sqlx::query_as::<_, Partner>("SELECT * FROM partners WHERE id = ?")
        .bind(&id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Partner {id}")))
}

pub async fn create(pool: &SqlitePool, cmd: CreatePartner) -> DomainResult<Partner> {
    let partner = Partner::new(cmd);
    sqlx::query(
        "INSERT INTO partners (id, partner_type, code, name, address, phone, email, tax_id, country_id, credit_limit, balance, notes, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?)"
    )
    .bind(&partner.id)
    .bind(&partner.partner_type)
    .bind(&partner.code)
    .bind(&partner.name)
    .bind(&partner.address)
    .bind(&partner.phone)
    .bind(&partner.email)
    .bind(&partner.tax_id)
    .bind(&partner.country_id)
    .bind(&partner.credit_limit)
    .bind(&partner.notes)
    .bind(&partner.created_at)
    .bind(&partner.updated_at)
    .execute(pool)
    .await?;
    Ok(partner)
}

pub async fn search(pool: &SqlitePool, q: &str) -> DomainResult<Vec<Partner>> {
    let pattern = format!("%{q}%");
    let rows = sqlx::query_as::<_, Partner>(
        "SELECT DISTINCT p.* FROM partners p
         LEFT JOIN partner_profiles pp ON pp.partner_id = p.id
         WHERE p.name LIKE ?1 OR p.code LIKE ?1 OR p.phone LIKE ?1 OR pp.loyalty_barcode LIKE ?1
         ORDER BY p.name LIMIT 50"
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}


