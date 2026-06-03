use tauri::State;

use crate::domain::{CreateDepot, Depot, UpdateDepot};
use crate::persistence::depot_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_depots(state: State<'_, AppState>) -> Result<Vec<Depot>, String> {
    depot_repo::list(&state.db).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_depot(state: State<'_, AppState>, id: String) -> Result<Depot, String> {
    depot_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_depots(state: State<'_, AppState>, q: String) -> Result<Vec<Depot>, String> {
    depot_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_depot(state: State<'_, AppState>, cmd: CreateDepot) -> Result<Depot, String> {
    depot_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_depot(state: State<'_, AppState>, cmd: UpdateDepot) -> Result<Depot, String> {
    depot_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_depot(state: State<'_, AppState>, id: String) -> Result<(), String> {
    depot_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
