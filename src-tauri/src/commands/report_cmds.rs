use crate::domain::{
    BarcodeReportRow, ManagementDashboardReport, ReportCatalogItem, SaleReport, SettlementLedgerRow,
    StockMovementReportRow,
};
use crate::persistence::{document_repo, report_repo};
use crate::reports::invoice::{generate_invoice, InvoiceData};
use crate::reports::receipt::{generate_receipt, ReceiptData};
use crate::reports::sale_report::generate_sale_report;
use crate::AppState;
use tauri::State;
use tauri_plugin_dialog::DialogExt;

fn print_pdf_bytes(app: tauri::AppHandle, default_name: String, pdf_bytes: Vec<u8>) {
    app.dialog()
        .file()
        .set_file_name(&default_name)
        .save_file(move |result| {
            if let Some(path) = result {
                let path_str = format!("{}", path);
                let _ = std::fs::write(&path_str, &pdf_bytes);
            }
        });
}

#[tauri::command]
pub async fn print_document_variant(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    doc_id: String,
    variant: String,
) -> Result<(), String> {
    let doc = document_repo::get_by_id(&state.db, &doc_id)
        .await
        .map_err(|e| e.to_string())?;
    let lines = document_repo::get_lines(&state.db, &doc_id)
        .await
        .map_err(|e| e.to_string())?;

    let default_name = format!(
        "{}_{}.pdf",
        variant,
        doc.doc_number.replace(['/', ' '], "_")
    );

    let pdf_bytes = match variant.as_str() {
        "invoice" | "sales_document" | "purchase_document" | "return_document" | "periodic_invoice" => {
            let data = InvoiceData {
                doc: &doc,
                lines: &lines,
                company_name: "FIRST MAG",
                company_address: "Adresse de l'entreprise",
                company_phone: "+216 00 000 000",
                company_tax_id: "0000000/A/M/000",
            };
            generate_invoice(&data)?
        }
        "receipt" | "cheque" | "payment_ledger" => {
            let payment_label = if variant == "cheque" {
                "Paiement: Cheque"
            } else {
                "Paiement: Ticket"
            };
            let data = ReceiptData {
                doc: &doc,
                lines: &lines,
                header: "FIRST MAG",
                payment_label,
            };
            generate_receipt(&data)?
        }
        _ => {
            let data = InvoiceData {
                doc: &doc,
                lines: &lines,
                company_name: "FIRST MAG",
                company_address: "Adresse de l'entreprise",
                company_phone: "+216 00 000 000",
                company_tax_id: "0000000/A/M/000",
            };
            generate_invoice(&data)?
        }
    };

    print_pdf_bytes(app, default_name, pdf_bytes);
    Ok(())
}

#[tauri::command]
pub async fn print_invoice(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    doc_id: String,
) -> Result<(), String> {
    print_document_variant(app, state, doc_id, "invoice".to_string()).await
}

#[tauri::command]
pub async fn print_receipt(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    doc_id: String,
) -> Result<(), String> {
    print_document_variant(app, state, doc_id, "receipt".to_string()).await
}

#[tauri::command]
pub async fn print_cheque(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    doc_id: String,
) -> Result<(), String> {
    print_document_variant(app, state, doc_id, "cheque".to_string()).await
}

#[tauri::command]
pub async fn get_x_report(state: State<'_, AppState>) -> Result<SaleReport, String> {
    let (since, until) = report_repo::today_range();
    report_repo::sales_summary(&state.db, &since, &until)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_z_report(state: State<'_, AppState>) -> Result<SaleReport, String> {
    let (since, until) = report_repo::today_range();
    report_repo::sales_summary(&state.db, &since, &until)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sale_report_range(
    state: State<'_, AppState>,
    since: String,
    until: String,
) -> Result<SaleReport, String> {
    report_repo::sales_summary(&state.db, &since, &until)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_report_catalog() -> Result<Vec<ReportCatalogItem>, String> {
    Ok(report_repo::report_catalog())
}

#[tauri::command]
pub async fn get_settlement_ledger(
    state: State<'_, AppState>,
    since: String,
    until: String,
    mode: Option<String>,
) -> Result<Vec<SettlementLedgerRow>, String> {
    report_repo::settlement_ledger(&state.db, &since, &until, mode.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_stock_movement_report(
    state: State<'_, AppState>,
    since: String,
    until: String,
) -> Result<Vec<StockMovementReportRow>, String> {
    report_repo::stock_movement_report(&state.db, &since, &until)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_barcode_listing(state: State<'_, AppState>) -> Result<Vec<BarcodeReportRow>, String> {
    report_repo::barcode_listing(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_management_dashboard_report(
    state: State<'_, AppState>,
    since: String,
    until: String,
) -> Result<ManagementDashboardReport, String> {
    report_repo::management_dashboard(&state.db, &since, &until)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn print_report(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    title: String,
) -> Result<(), String> {
    let (since, until) = report_repo::today_range();
    let report = report_repo::sales_summary(&state.db, &since, &until)
        .await
        .map_err(|e| e.to_string())?;
    let pdf_bytes = generate_sale_report(&report, &title)?;
    let default_name = format!("rapport_{}.pdf", title.replace(' ', "_"));
    print_pdf_bytes(app, default_name, pdf_bytes);
    Ok(())
}
