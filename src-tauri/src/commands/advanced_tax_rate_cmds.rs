use tauri::State;

use crate::domain::{AdvancedTaxRate, CreateAdvancedTaxRate, UpdateAdvancedTaxRate};
use crate::persistence::advanced_tax_rate_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_advanced_tax_rates(
    state: State<'_, AppState>,
) -> Result<Vec<AdvancedTaxRate>, String> {
    advanced_tax_rate_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_advanced_tax_rate(
    state: State<'_, AppState>,
    id: String,
) -> Result<AdvancedTaxRate, String> {
    advanced_tax_rate_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_advanced_tax_rates(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<AdvancedTaxRate>, String> {
    advanced_tax_rate_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_advanced_tax_rate(
    state: State<'_, AppState>,
    cmd: CreateAdvancedTaxRate,
) -> Result<AdvancedTaxRate, String> {
    advanced_tax_rate_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_advanced_tax_rate(
    state: State<'_, AppState>,
    cmd: UpdateAdvancedTaxRate,
) -> Result<AdvancedTaxRate, String> {
    advanced_tax_rate_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_advanced_tax_rate(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    advanced_tax_rate_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
