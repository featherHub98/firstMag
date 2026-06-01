use tauri::State;
use crate::AppState;
use crate::domain::{Article, CreateArticle, UpdateArticle};
use crate::persistence::article_repo;

#[tauri::command]
pub async fn list_articles(state: State<'_, AppState>) -> Result<Vec<Article>, String> {
    article_repo::list(&state.db).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_article(state: State<'_, AppState>, id: String) -> Result<Article, String> {
    article_repo::get_by_id(&state.db, &id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_articles(state: State<'_, AppState>, q: String) -> Result<Vec<Article>, String> {
    article_repo::search(&state.db, &q).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_article(state: State<'_, AppState>, cmd: CreateArticle) -> Result<Article, String> {
    article_repo::create(&state.db, cmd).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_article(state: State<'_, AppState>, cmd: UpdateArticle) -> Result<Article, String> {
    article_repo::update(&state.db, cmd).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_article(state: State<'_, AppState>, id: String) -> Result<(), String> {
    article_repo::delete(&state.db, &id).await.map_err(|e| e.to_string())
}
