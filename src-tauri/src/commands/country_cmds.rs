use tauri::State;

use crate::domain::{Country, CreateCountry, UpdateCountry};
use crate::persistence::country_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_countries(state: State<'_, AppState>) -> Result<Vec<Country>, String> {
    country_repo::list(&state.db).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_country(state: State<'_, AppState>, id: String) -> Result<Country, String> {
    country_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_countries(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Country>, String> {
    country_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_country(
    state: State<'_, AppState>,
    cmd: CreateCountry,
) -> Result<Country, String> {
    country_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_country(
    state: State<'_, AppState>,
    cmd: UpdateCountry,
) -> Result<Country, String> {
    country_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_country(state: State<'_, AppState>, id: String) -> Result<(), String> {
    country_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
