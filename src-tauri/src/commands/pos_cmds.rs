use crate::domain::{CashMovement, CashMovementSummary, CashSessionTotals, PosSession, PosTicket};
use crate::persistence::pos_repo;
use crate::AppState;
use serde::Deserialize;
use tauri::State;

#[derive(Debug, Deserialize)]
pub struct CreateCashMovementCmd {
    pub session_id: String,
    pub movement_type: String,
    pub amount: i64,
    pub description: String,
    pub user_id: String,
    pub user_name: String,
}

#[tauri::command]
pub async fn get_open_session(state: State<'_, AppState>) -> Result<Option<PosSession>, String> {
    pos_repo::get_open_session(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_session(
    state: State<'_, AppState>,
    cashier_id: String,
    opening_fund: i64,
    register_id: Option<String>,
) -> Result<PosSession, String> {
    let rid = register_id.unwrap_or_else(|| "1".to_string());
    pos_repo::open_session(&state.db, &rid, &cashier_id, opening_fund)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn close_session(
    state: State<'_, AppState>,
    session_id: String,
    closing_fund: i64,
) -> Result<PosSession, String> {
    pos_repo::close_session(&state.db, &session_id, closing_fund)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn new_ticket(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<PosTicket, String> {
    pos_repo::create_ticket(&state.db, &session_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_cash_movements(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<Vec<CashMovement>, String> {
    pos_repo::list_cash_movements(&state.db, &session_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_cash_movement(
    state: State<'_, AppState>,
    cmd: CreateCashMovementCmd,
) -> Result<CashMovement, String> {
    pos_repo::add_cash_movement(
        &state.db,
        &cmd.session_id,
        &cmd.movement_type,
        cmd.amount,
        &cmd.description,
        &cmd.user_id,
        &cmd.user_name,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_session_cash_summary(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<CashMovementSummary, String> {
    pos_repo::get_session_cash_summary(&state.db, &session_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_session_cash_totals(
    state: State<'_, AppState>,
    date_from: Option<String>,
    date_to: Option<String>,
) -> Result<Vec<CashSessionTotals>, String> {
    pos_repo::list_session_cash_totals(&state.db, date_from.as_deref(), date_to.as_deref())
        .await
        .map_err(|e| e.to_string())
}
