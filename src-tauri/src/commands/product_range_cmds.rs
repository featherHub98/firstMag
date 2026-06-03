use tauri::State;

use crate::domain::{CreateProductRange, ProductRange, UpdateProductRange};
use crate::persistence::product_range_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_product_ranges(state: State<'_, AppState>) -> Result<Vec<ProductRange>, String> {
    product_range_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_product_range(
    state: State<'_, AppState>,
    id: String,
) -> Result<ProductRange, String> {
    product_range_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_product_ranges(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<ProductRange>, String> {
    product_range_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_product_range(
    state: State<'_, AppState>,
    cmd: CreateProductRange,
) -> Result<ProductRange, String> {
    product_range_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_product_range(
    state: State<'_, AppState>,
    cmd: UpdateProductRange,
) -> Result<ProductRange, String> {
    product_range_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_product_range(state: State<'_, AppState>, id: String) -> Result<(), String> {
    product_range_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
