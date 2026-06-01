use tauri::State;
use tauri_plugin_dialog::DialogExt;
use crate::AppState;
use crate::persistence::{document_repo, report_repo};
use crate::reports::invoice::{generate_invoice, InvoiceData};
use crate::reports::receipt::{generate_receipt, ReceiptData};
use crate::reports::sale_report::generate_sale_report;

#[tauri::command]
pub async fn print_invoice(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    doc_id: String,
) -> Result<(), String> {
    let doc = document_repo::get_by_id(&state.db, &doc_id).await.map_err(|e| e.to_string())?;
    let lines = document_repo::get_lines(&state.db, &doc_id).await.map_err(|e| e.to_string())?;

    let data = InvoiceData {
        doc: &doc,
        lines: &lines,
        company_name: "FIRST MAG",
        company_address: "Adresse de l'entreprise",
        company_phone: "+216 00 000 000",
        company_tax_id: "0000000/A/M/000",
    };

    let pdf_bytes = generate_invoice(&data)?;
    let default_name = format!("facture_{}.pdf", doc.doc_number.replace('/', "_"));

    app.dialog()
        .file()
        .set_file_name(&default_name)
        .save_file(move |result| {
            if let Some(path) = result {
                let path_str = format!("{}", path);
                let _ = std::fs::write(&path_str, &pdf_bytes);
            }
        });

    Ok(())
}

#[tauri::command]
pub async fn print_receipt(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    doc_id: String,
) -> Result<(), String> {
    let doc = document_repo::get_by_id(&state.db, &doc_id).await.map_err(|e| e.to_string())?;
    let lines = document_repo::get_lines(&state.db, &doc_id).await.map_err(|e| e.to_string())?;

    let data = ReceiptData {
        doc: &doc,
        lines: &lines,
        header: "FIRST MAG",
        payment_label: "Paiement: Espèces",
    };

    let pdf_bytes = generate_receipt(&data)?;
    let default_name = format!("ticket_{}.pdf", doc.doc_number.replace('/', "_"));

    app.dialog()
        .file()
        .set_file_name(&default_name)
        .save_file(move |result| {
            if let Some(path) = result {
                let path_str = format!("{}", path);
                let _ = std::fs::write(&path_str, &pdf_bytes);
            }
        });

    Ok(())
}

#[tauri::command]
pub async fn get_x_report(
    state: State<'_, AppState>,
) -> Result<crate::domain::SaleReport, String> {
    let (since, until) = report_repo::today_range();
    let report = report_repo::sales_summary(&state.db, &since, &until).await.map_err(|e| e.to_string())?;
    Ok(report)
}

#[tauri::command]
pub async fn get_z_report(
    state: State<'_, AppState>,
) -> Result<crate::domain::SaleReport, String> {
    let (since, until) = report_repo::today_range();
    let report = report_repo::sales_summary(&state.db, &since, &until).await.map_err(|e| e.to_string())?;
    Ok(report)
}

#[tauri::command]
pub async fn print_report(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    title: String,
) -> Result<(), String> {
    let (since, until) = report_repo::today_range();
    let report = report_repo::sales_summary(&state.db, &since, &until).await.map_err(|e| e.to_string())?;
    let pdf_bytes = generate_sale_report(&report, &title)?;
    let default_name = format!("rapport_{}.pdf", title.replace(' ', "_"));

    app.dialog()
        .file()
        .set_file_name(&default_name)
        .save_file(move |result| {
            if let Some(path) = result {
                let path_str = format!("{}", path);
                let _ = std::fs::write(&path_str, &pdf_bytes);
            }
        });

    Ok(())
}
