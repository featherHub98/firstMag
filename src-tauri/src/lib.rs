pub mod commands;
pub mod domain;
pub mod error;
pub mod fiscal;
pub mod persistence;
pub mod reports;
pub mod service;

use std::sync::Mutex;
use sqlx::SqlitePool;
use tauri::Manager;
use fiscal::commands::FiscalDevice;

pub struct AppState {
    pub db: SqlitePool,
    pub fiscal: Mutex<Option<FiscalDevice>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
            let db_path = app_dir.join("firstmag.db");
            let db_path_str = db_path.to_string_lossy().to_string();

            let rt = tokio::runtime::Runtime::new().expect("failed to create runtime");
            let pool = rt.block_on(async {
                persistence::init_db(&db_path_str)
                    .await
                    .expect("failed to initialize database")
            });

            app.manage(AppState { db: pool, fiscal: Mutex::new(None) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::article_cmds::list_articles,
            commands::article_cmds::get_article,
            commands::article_cmds::search_articles,
            commands::article_cmds::create_article,
            commands::article_cmds::update_article,
            commands::article_cmds::delete_article,
            commands::sale_cmds::list_documents,
            commands::sale_cmds::get_document,
            commands::sale_cmds::get_document_lines,
            commands::sale_cmds::create_document,
            commands::sale_cmds::transform_document,
            commands::sale_cmds::confirm_document,
            commands::pos_cmds::get_open_session,
            commands::pos_cmds::open_session,
            commands::pos_cmds::close_session,
            commands::pos_cmds::new_ticket,
            commands::partner_cmds::list_partners,
            commands::partner_cmds::get_partner,
            commands::partner_cmds::create_partner,
            commands::partner_cmds::search_partners,
            commands::stock_cmds::get_stock_level,
            commands::stock_cmds::list_stock_movements,
            commands::report_cmds::print_invoice,
            commands::report_cmds::print_receipt,
            commands::report_cmds::get_x_report,
            commands::report_cmds::get_z_report,
            commands::report_cmds::print_report,
            commands::fiscal_cmds::fiscal_connect,
            commands::fiscal_cmds::fiscal_disconnect,
            commands::fiscal_cmds::fiscal_cpx,
            commands::fiscal_cmds::fiscal_cpm,
            commands::fiscal_cmds::fiscal_cpb,
            commands::fiscal_cmds::fiscal_rsx,
            commands::fiscal_cmds::fiscal_rsz,
            commands::fiscal_cmds::fiscal_ruz,
            commands::fiscal_cmds::fiscal_reset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
