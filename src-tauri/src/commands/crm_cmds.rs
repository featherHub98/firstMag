use crate::domain::{
    CreatePartnerFollowUp, CreatePartnerReclamation, PartnerFollowUp, PartnerKpis, PartnerProfile,
    PartnerReclamation, UpdatePartnerFollowUpStatus, UpdatePartnerReclamationStatus,
    UpsertPartnerProfile,
};
use crate::persistence::crm_repo;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_partner_profile(
    state: State<'_, AppState>,
    partner_id: String,
) -> Result<PartnerProfile, String> {
    crm_repo::get_profile(&state.db, &partner_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn upsert_partner_profile(
    state: State<'_, AppState>,
    cmd: UpsertPartnerProfile,
) -> Result<PartnerProfile, String> {
    crm_repo::upsert_profile(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_partner_kpis(
    state: State<'_, AppState>,
    partner_id: String,
) -> Result<PartnerKpis, String> {
    crm_repo::get_partner_kpis(&state.db, &partner_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_partner_followups(
    state: State<'_, AppState>,
    partner_id: String,
) -> Result<Vec<PartnerFollowUp>, String> {
    crm_repo::list_followups(&state.db, &partner_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_partner_followup(
    state: State<'_, AppState>,
    cmd: CreatePartnerFollowUp,
) -> Result<PartnerFollowUp, String> {
    crm_repo::create_followup(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_partner_followup_status(
    state: State<'_, AppState>,
    cmd: UpdatePartnerFollowUpStatus,
) -> Result<PartnerFollowUp, String> {
    crm_repo::update_followup_status(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_partner_reclamations(
    state: State<'_, AppState>,
    partner_id: Option<String>,
) -> Result<Vec<PartnerReclamation>, String> {
    crm_repo::list_reclamations(&state.db, partner_id.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_partner_reclamation(
    state: State<'_, AppState>,
    cmd: CreatePartnerReclamation,
) -> Result<PartnerReclamation, String> {
    crm_repo::create_reclamation(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_partner_reclamation_status(
    state: State<'_, AppState>,
    cmd: UpdatePartnerReclamationStatus,
) -> Result<PartnerReclamation, String> {
    crm_repo::update_reclamation_status(&state.db, cmd)
        .await
        .map_err(|e| e.to_string())
}
