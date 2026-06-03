use tauri::State;

use crate::domain::{CreateCurrency, Currency, UpdateCurrency};
use crate::persistence::currency_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_currencies(state: State<'_, AppState>) -> Result<Vec<Currency>, String> {
    currency_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_currency(state: State<'_, AppState>, id: String) -> Result<Currency, String> {
    currency_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_currencies(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Currency>, String> {
    currency_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_currency(
    state: State<'_, AppState>,
    cmd: CreateCurrency,
) -> Result<Currency, String> {
    currency_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_currency(
    state: State<'_, AppState>,
    cmd: UpdateCurrency,
) -> Result<Currency, String> {
    currency_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_currency(state: State<'_, AppState>, id: String) -> Result<(), String> {
    currency_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
