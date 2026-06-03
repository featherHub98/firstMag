use tauri::State;

use crate::domain::{CreatePaymentMethod, PaymentMethod, UpdatePaymentMethod};
use crate::persistence::payment_method_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_payment_methods(
    state: State<'_, AppState>,
) -> Result<Vec<PaymentMethod>, String> {
    payment_method_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_payment_method(
    state: State<'_, AppState>,
    id: String,
) -> Result<PaymentMethod, String> {
    payment_method_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_payment_methods(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<PaymentMethod>, String> {
    payment_method_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_payment_method(
    state: State<'_, AppState>,
    cmd: CreatePaymentMethod,
) -> Result<PaymentMethod, String> {
    payment_method_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_payment_method(
    state: State<'_, AppState>,
    cmd: UpdatePaymentMethod,
) -> Result<PaymentMethod, String> {
    payment_method_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_payment_method(state: State<'_, AppState>, id: String) -> Result<(), String> {
    payment_method_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
