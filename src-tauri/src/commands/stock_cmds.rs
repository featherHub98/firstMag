use crate::domain::stock::{StockLevel, StockMovement, StockReport};
use crate::persistence::stock_repo;
use crate::AppState;
use serde::Deserialize;
use tauri::State;

#[derive(Debug, Deserialize)]
pub struct CreateStockMovementCmd {
    pub article_id: String,
    pub source_depot_id: Option<String>,
    pub destination_depot_id: Option<String>,
    pub quantity: i64,
    pub movement_type: String,
    pub reference: String,
    pub notes: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStockMovementCmd {
    pub id: String,
    pub article_id: String,
    pub source_depot_id: Option<String>,
    pub destination_depot_id: Option<String>,
    pub quantity: i64,
    pub movement_type: String,
    pub reference: String,
    pub notes: String,
}

#[derive(Debug, Deserialize)]
pub struct ListStockReportsFilterCmd {
    pub depot_id: Option<String>,
    pub article_id: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}

#[tauri::command]
pub async fn get_stock_level(
    state: State<'_, AppState>,
    article_id: String,
) -> Result<StockLevel, String> {
    let result: StockLevel = stock_repo::get_level(&state.db, &article_id)
        .await
        .map_err(|e: crate::domain::DomainError| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn list_stock_movements(
    state: State<'_, AppState>,
    article_id: Option<String>,
) -> Result<Vec<StockMovement>, String> {
    let result: Vec<StockMovement> = stock_repo::list_movements(&state.db, article_id.as_deref())
        .await
        .map_err(|e: crate::domain::DomainError| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn create_stock_movement(
    state: State<'_, AppState>,
    cmd: CreateStockMovementCmd,
) -> Result<StockMovement, String> {
    if cmd.quantity <= 0 {
        return Err("quantity doit être supérieure à 0".to_string());
    }

    let depot_id = match cmd.movement_type.as_str() {
        "entry" => cmd.destination_depot_id.as_deref(),
        "exit" => cmd.source_depot_id.as_deref(),
        "transfer" => cmd.source_depot_id.as_deref(),
        _ => None,
    }
    .ok_or_else(|| "depot_id requis pour ce type de mouvement".to_string())?;

    let target_depot_id = if cmd.movement_type == "transfer" {
        cmd.destination_depot_id.as_deref()
    } else {
        None
    };
    if cmd.movement_type == "transfer" && depot_id == target_depot_id.unwrap_or_default() {
        return Err("Le dépôt source doit être différent du dépôt destination".to_string());
    }

    let result = stock_repo::create_movement(
        &state.db,
        &cmd.movement_type,
        &cmd.article_id,
        depot_id,
        target_depot_id,
        cmd.quantity,
        &cmd.reference,
        &cmd.notes,
    )
    .await
    .map_err(|e: crate::domain::DomainError| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn update_stock_movement(
    state: State<'_, AppState>,
    cmd: UpdateStockMovementCmd,
) -> Result<StockMovement, String> {
    if cmd.quantity <= 0 {
        return Err("quantity doit être supérieure à 0".to_string());
    }

    let depot_id = match cmd.movement_type.as_str() {
        "entry" => cmd.destination_depot_id.as_deref(),
        "exit" => cmd.source_depot_id.as_deref(),
        "transfer" => cmd.source_depot_id.as_deref(),
        _ => None,
    }
    .ok_or_else(|| "depot_id requis pour ce type de mouvement".to_string())?;

    let target_depot_id = if cmd.movement_type == "transfer" {
        cmd.destination_depot_id.as_deref()
    } else {
        None
    };
    if cmd.movement_type == "transfer" && depot_id == target_depot_id.unwrap_or_default() {
        return Err("Le dépôt source doit être différent du dépôt destination".to_string());
    }

    stock_repo::update_movement(
        &state.db,
        &cmd.id,
        &cmd.movement_type,
        &cmd.article_id,
        depot_id,
        target_depot_id,
        cmd.quantity,
        &cmd.reference,
        &cmd.notes,
    )
    .await
    .map_err(|e: crate::domain::DomainError| e.to_string())
}

#[tauri::command]
pub async fn delete_stock_movement(state: State<'_, AppState>, id: String) -> Result<(), String> {
    stock_repo::delete_movement(&state.db, &id)
        .await
        .map_err(|e: crate::domain::DomainError| e.to_string())
}

#[tauri::command]
pub async fn list_stock_reports(
    state: State<'_, AppState>,
    filter: Option<ListStockReportsFilterCmd>,
) -> Result<Vec<StockReport>, String> {
    let filter = filter.unwrap_or(ListStockReportsFilterCmd {
        depot_id: None,
        article_id: None,
        date_from: None,
        date_to: None,
    });
    stock_repo::list_reports(
        &state.db,
        stock_repo::StockReportFilter {
            depot_id: filter.depot_id.as_deref(),
            article_id: filter.article_id.as_deref(),
            date_from: filter.date_from.as_deref(),
            date_to: filter.date_to.as_deref(),
        },
    )
    .await
    .map_err(|e: crate::domain::DomainError| e.to_string())
}
