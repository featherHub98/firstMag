use tauri::State;

use crate::domain::{Bank, CreateBank, UpdateBank};
use crate::persistence::bank_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_banks(state: State<'_, AppState>) -> Result<Vec<Bank>, String> {
    bank_repo::list(&state.db).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_bank(state: State<'_, AppState>, id: String) -> Result<Bank, String> {
    bank_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_banks(state: State<'_, AppState>, q: String) -> Result<Vec<Bank>, String> {
    bank_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_bank(state: State<'_, AppState>, cmd: CreateBank) -> Result<Bank, String> {
    bank_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_bank(state: State<'_, AppState>, cmd: UpdateBank) -> Result<Bank, String> {
    bank_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_bank(state: State<'_, AppState>, id: String) -> Result<(), String> {
    bank_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
