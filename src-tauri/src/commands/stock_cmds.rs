use tauri::State;
use crate::AppState;
use crate::domain::stock::{StockLevel, StockMovement};
use crate::persistence::stock_repo;

#[tauri::command]
pub async fn get_stock_level(state: State<'_, AppState>, article_id: String) -> Result<StockLevel, String> {
    let result: StockLevel = stock_repo::get_level(&state.db, &article_id)
        .await
        .map_err(|e: crate::domain::DomainError| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn list_stock_movements(state: State<'_, AppState>, article_id: Option<String>) -> Result<Vec<StockMovement>, String> {
    let result: Vec<StockMovement> = stock_repo::list_movements(&state.db, article_id.as_deref())
        .await
        .map_err(|e: crate::domain::DomainError| e.to_string())?;
    Ok(result)
}
