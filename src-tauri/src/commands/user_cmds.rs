use tauri::State;

use crate::domain::{LoginResult, Role, User};
use crate::persistence::user_repo;
use crate::AppState;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct UpdateRolePermissionsCmd {
    pub role_id: String,
    pub permissions: Vec<String>,
}

#[tauri::command]
pub async fn list_users(state: State<'_, AppState>) -> Result<Vec<User>, String> {
    user_repo::list_users(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_roles(state: State<'_, AppState>) -> Result<Vec<Role>, String> {
    user_repo::list_roles(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn login_user(state: State<'_, AppState>, pin: String) -> Result<LoginResult, String> {
    user_repo::authenticate_pin(&state.db, &pin)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_role_permissions(
    state: State<'_, AppState>,
    cmd: UpdateRolePermissionsCmd,
) -> Result<(), String> {
    user_repo::update_role_permissions(&state.db, &cmd.role_id, &cmd.permissions)
        .await
        .map_err(|e| e.to_string())
}
