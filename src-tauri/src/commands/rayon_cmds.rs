use tauri::State;

use crate::domain::{CreateRayon, Rayon, UpdateRayon};
use crate::persistence::rayon_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_rayons(state: State<'_, AppState>) -> Result<Vec<Rayon>, String> {
    rayon_repo::list(&state.db).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_rayon(state: State<'_, AppState>, id: String) -> Result<Rayon, String> {
    rayon_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_rayons(state: State<'_, AppState>, q: String) -> Result<Vec<Rayon>, String> {
    rayon_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_rayon(state: State<'_, AppState>, cmd: CreateRayon) -> Result<Rayon, String> {
    rayon_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_rayon(state: State<'_, AppState>, cmd: UpdateRayon) -> Result<Rayon, String> {
    rayon_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_rayon(state: State<'_, AppState>, id: String) -> Result<(), String> {
    rayon_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
