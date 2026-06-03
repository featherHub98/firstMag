use tauri::State;

use crate::domain::{CreateRegister, Register, UpdateRegister};
use crate::persistence::register_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_registers(state: State<'_, AppState>) -> Result<Vec<Register>, String> {
    register_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_register(state: State<'_, AppState>, id: String) -> Result<Register, String> {
    register_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_registers(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Register>, String> {
    register_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_register(
    state: State<'_, AppState>,
    cmd: CreateRegister,
) -> Result<Register, String> {
    register_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_register(
    state: State<'_, AppState>,
    cmd: UpdateRegister,
) -> Result<Register, String> {
    register_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_register(state: State<'_, AppState>, id: String) -> Result<(), String> {
    register_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
