use std::collections::HashMap;

use serde::Deserialize;
use tauri::State;

use crate::domain::DocumentSeries;
use crate::persistence::settings_repo;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct UpdateDocumentSeriesCmd {
    pub id: String,
    pub prefix: String,
    pub next_number: i64,
    pub format: String,
}

#[tauri::command]
pub async fn get_app_settings(
    state: State<'_, AppState>,
    keys: Vec<String>,
) -> Result<HashMap<String, String>, String> {
    settings_repo::get_app_settings(&state.db, &keys)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_app_settings(
    state: State<'_, AppState>,
    entries: HashMap<String, String>,
) -> Result<(), String> {
    settings_repo::set_app_settings(&state.db, &entries)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_document_series(
    state: State<'_, AppState>,
) -> Result<Vec<DocumentSeries>, String> {
    settings_repo::list_document_series(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_document_series(
    state: State<'_, AppState>,
    cmd: UpdateDocumentSeriesCmd,
) -> Result<(), String> {
    settings_repo::update_document_series(
        &state.db,
        &cmd.id,
        &cmd.prefix,
        cmd.next_number,
        &cmd.format,
    )
    .await
    .map_err(|e| e.to_string())
}
