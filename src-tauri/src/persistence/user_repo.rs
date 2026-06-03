use sqlx::{FromRow, SqlitePool};

use crate::domain::{DomainError, DomainResult, LoginResult, Role, User};

#[derive(Debug, FromRow)]
struct UserRow {
    id: String,
    code: String,
    name: String,
    role: String,
    active: bool,
}

#[derive(Debug, FromRow)]
struct RoleRow {
    id: String,
    name: String,
    permissions: String,
}

fn parse_permissions(raw: &str) -> Vec<String> {
    serde_json::from_str::<Vec<String>>(raw).unwrap_or_default()
}

pub async fn list_users(pool: &SqlitePool) -> DomainResult<Vec<User>> {
    let rows = sqlx::query_as::<_, UserRow>(
        "SELECT id, code, name, role, active
         FROM users
         ORDER BY active DESC, code",
    )
    .fetch_all(pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|u| User {
            id: u.id,
            code: u.code,
            name: u.name,
            role: u.role,
            active: u.active,
        })
        .collect())
}

pub async fn list_roles(pool: &SqlitePool) -> DomainResult<Vec<Role>> {
    let rows =
        sqlx::query_as::<_, RoleRow>("SELECT id, name, permissions FROM roles ORDER BY name")
            .fetch_all(pool)
            .await?;

    Ok(rows
        .into_iter()
        .map(|r| Role {
            id: r.id,
            name: r.name,
            permissions: parse_permissions(&r.permissions),
        })
        .collect())
}

pub async fn authenticate_pin(pool: &SqlitePool, pin: &str) -> DomainResult<LoginResult> {
    let user = sqlx::query_as::<_, UserRow>(
        "SELECT id, code, name, role, active
         FROM users
         WHERE active = 1 AND password_hash = ?
         LIMIT 1",
    )
    .bind(&pin)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| DomainError::InvalidOperation("Code PIN incorrect".into()))?;

    let role = sqlx::query_as::<_, RoleRow>("SELECT id, name, permissions FROM roles WHERE id = ?")
        .bind(&user.role)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| DomainError::NotFound(format!("Role {}", user.role)))?;

    Ok(LoginResult {
        id: user.id,
        code: user.code,
        name: user.name,
        role: role.id,
        permissions: parse_permissions(&role.permissions),
    })
}

pub async fn update_role_permissions(
    pool: &SqlitePool,
    role_id: &str,
    permissions: &[String],
) -> DomainResult<()> {
    let payload = serde_json::to_string(permissions).unwrap_or_else(|_| "[]".to_string());
    sqlx::query("UPDATE roles SET permissions = ? WHERE id = ?")
        .bind(&payload)
        .bind(&role_id)
        .execute(pool)
        .await?;
    Ok(())
}


