use tauri::State;

use crate::domain::{Cashier, CreateCashier, UpdateCashier};
use crate::persistence::cashier_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_cashiers(state: State<'_, AppState>) -> Result<Vec<Cashier>, String> {
    cashier_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_cashier(state: State<'_, AppState>, id: String) -> Result<Cashier, String> {
    cashier_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_cashiers(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Cashier>, String> {
    cashier_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_cashier(
    state: State<'_, AppState>,
    cmd: CreateCashier,
) -> Result<Cashier, String> {
    cashier_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_cashier(
    state: State<'_, AppState>,
    cmd: UpdateCashier,
) -> Result<Cashier, String> {
    cashier_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_cashier(state: State<'_, AppState>, id: String) -> Result<(), String> {
    cashier_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
