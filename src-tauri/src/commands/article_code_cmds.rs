use crate::domain::{ArticleCode, CreateArticleCode};
use crate::persistence::article_code_repo;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn list_article_codes(
    state: State<'_, AppState>,
    article_id: Option<String>,
) -> Result<Vec<ArticleCode>, String> {
    article_code_repo::list(&state.db, article_id.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_article_codes(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<ArticleCode>, String> {
    article_code_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_article_code(
    state: State<'_, AppState>,
    cmd: CreateArticleCode,
) -> Result<ArticleCode, String> {
    article_code_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_article_code(state: State<'_, AppState>, id: String) -> Result<(), String> {
    article_code_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
