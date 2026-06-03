use crate::domain::{ArticleBomHeader, ArticleBomLine, CreateArticleBomHeader, CreateArticleBomLine};
use crate::persistence::article_bom_repo;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn list_article_bom_headers(
    state: State<'_, AppState>,
    parent_article_id: Option<String>,
) -> Result<Vec<ArticleBomHeader>, String> {
    article_bom_repo::list_headers(&state.db, parent_article_id.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_article_bom_header(
    state: State<'_, AppState>,
    cmd: CreateArticleBomHeader,
) -> Result<ArticleBomHeader, String> {
    article_bom_repo::create_header(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_article_bom_header_active(
    state: State<'_, AppState>,
    id: String,
    active: bool,
) -> Result<(), String> {
    article_bom_repo::set_header_active(&state.db, &id, active)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_article_bom_lines(
    state: State<'_, AppState>,
    bom_id: String,
) -> Result<Vec<ArticleBomLine>, String> {
    article_bom_repo::list_lines(&state.db, &bom_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_article_bom_line(
    state: State<'_, AppState>,
    cmd: CreateArticleBomLine,
) -> Result<ArticleBomLine, String> {
    article_bom_repo::create_line(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_article_bom_line(state: State<'_, AppState>, id: String) -> Result<(), String> {
    article_bom_repo::delete_line(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
