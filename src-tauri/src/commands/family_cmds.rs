use tauri::State;

use crate::domain::{ArticleFamily, CreateArticleFamily, UpdateArticleFamily};
use crate::persistence::family_repo;
use crate::AppState;

#[tauri::command]
pub async fn list_article_families(
    state: State<'_, AppState>,
) -> Result<Vec<ArticleFamily>, String> {
    family_repo::list(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_article_family(
    state: State<'_, AppState>,
    id: String,
) -> Result<ArticleFamily, String> {
    family_repo::get_by_id(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_article_families(
    state: State<'_, AppState>,
    q: String,
) -> Result<Vec<ArticleFamily>, String> {
    family_repo::search(&state.db, &q)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_article_family(
    state: State<'_, AppState>,
    cmd: CreateArticleFamily,
) -> Result<ArticleFamily, String> {
    family_repo::create(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_article_family(
    state: State<'_, AppState>,
    cmd: UpdateArticleFamily,
) -> Result<ArticleFamily, String> {
    family_repo::update(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_article_family(state: State<'_, AppState>, id: String) -> Result<(), String> {
    family_repo::delete(&state.db, &id)
        .await
        .map_err(|e| e.to_string())
}
