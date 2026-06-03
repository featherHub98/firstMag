use tauri::State;

use crate::domain::{AccountingCategory, CreateAccountingCategory, UpdateAccountingCategory};
use crate::persistence::accounting_category_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_accounting_categories(
    state: State<'_, AppState>,
) -> Result<Vec<AccountingCategory>, String> {
    accounting_category_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_accounting_category(
    state: State<'_, AppState>,
    id: String,
) -> Result<AccountingCategory, String> {
    accounting_category_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_accounting_categories(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<AccountingCategory>, String> {
    accounting_category_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_accounting_category(
    state: State<'_, AppState>,
    cmd: CreateAccountingCategory,
) -> Result<AccountingCategory, String> {
    accounting_category_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_accounting_category(
    state: State<'_, AppState>,
    cmd: UpdateAccountingCategory,
) -> Result<AccountingCategory, String> {
    accounting_category_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_accounting_category(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    accounting_category_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
