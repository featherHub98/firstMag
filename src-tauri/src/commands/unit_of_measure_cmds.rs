use tauri::State;

use crate::domain::{CreateUnitOfMeasure, UnitOfMeasure, UpdateUnitOfMeasure};
use crate::persistence::unit_of_measure_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_units_of_measure(
    state: State<'_, AppState>,
) -> Result<Vec<UnitOfMeasure>, String> {
    unit_of_measure_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_unit_of_measure(
    state: State<'_, AppState>,
    id: String,
) -> Result<UnitOfMeasure, String> {
    unit_of_measure_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_units_of_measure(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<UnitOfMeasure>, String> {
    unit_of_measure_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_unit_of_measure(
    state: State<'_, AppState>,
    cmd: CreateUnitOfMeasure,
) -> Result<UnitOfMeasure, String> {
    unit_of_measure_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_unit_of_measure(
    state: State<'_, AppState>,
    cmd: UpdateUnitOfMeasure,
) -> Result<UnitOfMeasure, String> {
    unit_of_measure_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_unit_of_measure(state: State<'_, AppState>, id: String) -> Result<(), String> {
    unit_of_measure_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
