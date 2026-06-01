use tauri::State;
use crate::AppState;
use crate::domain::{PosSession, PosTicket};
use crate::persistence::pos_repo;

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
) -> Result<PosSession, String> {
    pos_repo::open_session(&state.db, &cashier_id, opening_fund)
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
