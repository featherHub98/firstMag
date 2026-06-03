use tauri::State;

use crate::domain::{CreateSalesperson, Salesperson, UpdateSalesperson};
use crate::persistence::salesperson_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_salespersons(state: State<'_, AppState>) -> Result<Vec<Salesperson>, String> {
    salesperson_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_salesperson(
    state: State<'_, AppState>,
    id: String,
) -> Result<Salesperson, String> {
    salesperson_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_salespersons(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<Salesperson>, String> {
    salesperson_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_salesperson(
    state: State<'_, AppState>,
    cmd: CreateSalesperson,
) -> Result<Salesperson, String> {
    salesperson_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_salesperson(
    state: State<'_, AppState>,
    cmd: UpdateSalesperson,
) -> Result<Salesperson, String> {
    salesperson_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_salesperson(state: State<'_, AppState>, id: String) -> Result<(), String> {
    salesperson_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
