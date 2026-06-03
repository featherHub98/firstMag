use crate::domain::{CreateDocument, Document, DocumentLine, DocumentStatus};
use crate::persistence::document_repo;
use crate::service::DocumentService;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn list_documents(
    state: State<'_, AppState>,
    doc_type: Option<String>,
) -> Result<Vec<Document>, String> {
    document_repo::list(&state.db, doc_type.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_document(state: State<'_, AppState>, id: String) -> Result<Document, String> {
    document_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_document_lines(
    state: State<'_, AppState>,
    id: String,
) -> Result<Vec<DocumentLine>, String> {
    document_repo::get_lines(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_document(
    state: State<'_, AppState>,
    cmd: CreateDocument,
) -> Result<(Document, Vec<DocumentLine>), String> {
    DocumentService::create_document(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn transform_document(
    state: State<'_, AppState>,
    id: String,
    target_type: Option<String>,
) -> Result<Document, String> {
    DocumentService::transform_document_to(&state.db, &id, target_type.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn confirm_document(state: State<'_, AppState>, id: String) -> Result<(), String> {
    document_repo::update_status(&state.db, &id, "confirmed")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_document_status(
    state: State<'_, AppState>,
    id: String,
    status: String,
) -> Result<(), String> {
    let parsed =
        DocumentStatus::from_str(&status).ok_or_else(|| format!("Statut invalide: {}", status))?;
    document_repo::update_status(&state.db, &id, parsed.as_str())
        .await
        .map_err(|e| e.to_string())
}
