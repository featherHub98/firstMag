use tauri::State;

use crate::domain::{CreateTariffCategory, TariffCategory, UpdateTariffCategory};
use crate::persistence::tariff_category_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_tariff_categories(
    state: State<'_, AppState>,
) -> Result<Vec<TariffCategory>, String> {
    tariff_category_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tariff_category(
    state: State<'_, AppState>,
    id: String,
) -> Result<TariffCategory, String> {
    tariff_category_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_tariff_categories(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<TariffCategory>, String> {
    tariff_category_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_tariff_category(
    state: State<'_, AppState>,
    cmd: CreateTariffCategory,
) -> Result<TariffCategory, String> {
    tariff_category_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_tariff_category(
    state: State<'_, AppState>,
    cmd: UpdateTariffCategory,
) -> Result<TariffCategory, String> {
    tariff_category_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_tariff_category(state: State<'_, AppState>, id: String) -> Result<(), String> {
    tariff_category_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
