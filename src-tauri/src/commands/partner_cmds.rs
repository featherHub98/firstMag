use tauri::State;
use crate::AppState;
use crate::domain::{Partner, CreatePartner};
use crate::persistence::partner_repo;

#[tauri::command]
pub async fn list_partners(
    state: State<'_, AppState>,
    partner_type: Option<String>,
) -> Result<Vec<Partner>, String> {
    partner_repo::list(&state.db, partner_type.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_partner(state: State<'_, AppState>, id: String) -> Result<Partner, String> {
    partner_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_partner(
    state: State<'_, AppState>,
    cmd: CreatePartner,
) -> Result<Partner, String> {
    partner_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_partners(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Partner>, String> {
    partner_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}
