use tauri::State;

use crate::domain::{CreateGondola, Gondola, UpdateGondola};
use crate::persistence::gondola_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_gondolas(state: State<'_, AppState>) -> Result<Vec<Gondola>, String> {
    gondola_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_gondola(state: State<'_, AppState>, id: String) -> Result<Gondola, String> {
    gondola_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_gondolas(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Gondola>, String> {
    gondola_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_gondola(
    state: State<'_, AppState>,
    cmd: CreateGondola,
) -> Result<Gondola, String> {
    gondola_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_gondola(
    state: State<'_, AppState>,
    cmd: UpdateGondola,
) -> Result<Gondola, String> {
    gondola_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_gondola(state: State<'_, AppState>, id: String) -> Result<(), String> {
    gondola_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
