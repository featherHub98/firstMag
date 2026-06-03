use crate::fiscal::commands::FiscalDevice;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn fiscal_connect(state: State<'_, AppState>, port: String) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = FiscalDevice::open(&port, 57600)?;
    let info = format!("Connecté à {port} (57600 8N1)");
    *guard = Some(dev);
    Ok(info)
}

#[tauri::command]
pub async fn fiscal_disconnect(state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    *guard = None;
    Ok(())
}

#[tauri::command]
pub async fn fiscal_cpx(
    state: State<'_, AppState>,
    operator: String,
    customer: String,
) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.cpx(&operator, &customer)
}

#[tauri::command]
pub async fn fiscal_cpm(
    state: State<'_, AppState>,
    amount: i64,
    mode: String,
) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.cpm(amount, &mode)
}

#[tauri::command]
pub async fn fiscal_cpb(state: State<'_, AppState>) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.cpb()
}

#[tauri::command]
pub async fn fiscal_rsx(state: State<'_, AppState>, report_type: u32) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.rsx(report_type)
}

#[tauri::command]
pub async fn fiscal_rsz(state: State<'_, AppState>, report_type: u32) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.rsz(report_type)
}

#[tauri::command]
pub async fn fiscal_ruz(state: State<'_, AppState>) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.ruz()
}

#[tauri::command]
pub async fn fiscal_reset(state: State<'_, AppState>) -> Result<String, String> {
    let mut guard = state
        .fiscal
        .lock()
        .map_err(|e| format!("Lock error: {e}"))?;
    let dev = guard
        .as_mut()
        .ok_or_else(|| "Imprimante fiscale non connectée".to_string())?;
    dev.reset()
}
