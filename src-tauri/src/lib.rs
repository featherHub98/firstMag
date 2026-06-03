#![allow(clippy::items_after_test_module)]
#![allow(clippy::needless_borrows_for_generic_args)]
#![allow(clippy::should_implement_trait)]
#![allow(clippy::too_many_arguments)]

pub mod commands;
pub mod domain;
pub mod error;
pub mod fiscal;
pub mod persistence;
pub mod reports;
pub mod service;

use fiscal::commands::FiscalDevice;
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::Manager;

pub struct AppState {
    pub db: SqlitePool,
    pub db_path: String,
    pub fiscal: Mutex<Option<FiscalDevice>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
            let db_path = app_dir.join("firstmag.db");
            let db_path_str = db_path.to_string_lossy().to_string();

            if !db_path.exists() {
                let res_dir = app.path().resource_dir().ok();
                if let Some(rd) = res_dir {
                    let bundled = rd.join("db/firstmag.db");
                    if bundled.exists() {
                        std::fs::copy(&bundled, &db_path).ok();
                    }
                }
            }

            let rt = tokio::runtime::Runtime::new().expect("failed to create runtime");
            let pool = rt.block_on(async {
                persistence::init_db(&db_path_str)
                    .await
                    .expect("failed to initialize database")
            });

            app.manage(AppState {
                db: pool,
                db_path: db_path_str,
                fiscal: Mutex::new(None),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::article_cmds::list_articles,
            commands::article_cmds::get_article,
            commands::article_cmds::search_articles,
            commands::article_cmds::create_article,
            commands::article_cmds::update_article,
            commands::article_cmds::delete_article,
            commands::article_bom_cmds::list_article_bom_headers,
            commands::article_bom_cmds::create_article_bom_header,
            commands::article_bom_cmds::set_article_bom_header_active,
            commands::article_bom_cmds::list_article_bom_lines,
            commands::article_bom_cmds::create_article_bom_line,
            commands::article_bom_cmds::delete_article_bom_line,
            commands::article_code_cmds::list_article_codes,
            commands::article_code_cmds::search_article_codes,
            commands::article_code_cmds::create_article_code,
            commands::article_code_cmds::delete_article_code,
            commands::sale_cmds::list_documents,
            commands::sale_cmds::get_document,
            commands::sale_cmds::get_document_lines,
            commands::sale_cmds::create_document,
            commands::sale_cmds::transform_document,
            commands::sale_cmds::confirm_document,
            commands::sale_cmds::set_document_status,
            commands::pos_cmds::get_open_session,
            commands::pos_cmds::open_session,
            commands::pos_cmds::close_session,
            commands::pos_cmds::new_ticket,
            commands::pos_cmds::list_cash_movements,
            commands::pos_cmds::add_cash_movement,
            commands::pos_cmds::get_session_cash_summary,
            commands::pos_cmds::list_session_cash_totals,
            commands::partner_cmds::list_partners,
            commands::partner_cmds::get_partner,
            commands::partner_cmds::create_partner,
            commands::partner_cmds::search_partners,
            commands::unit_of_measure_cmds::list_units_of_measure,
            commands::unit_of_measure_cmds::get_unit_of_measure,
            commands::unit_of_measure_cmds::search_units_of_measure,
            commands::unit_of_measure_cmds::create_unit_of_measure,
            commands::unit_of_measure_cmds::update_unit_of_measure,
            commands::unit_of_measure_cmds::delete_unit_of_measure,
            commands::salesperson_cmds::list_salespersons,
            commands::salesperson_cmds::get_salesperson,
            commands::salesperson_cmds::search_salespersons,
            commands::salesperson_cmds::create_salesperson,
            commands::salesperson_cmds::update_salesperson,
            commands::salesperson_cmds::delete_salesperson,
            commands::family_cmds::list_article_families,
            commands::family_cmds::get_article_family,
            commands::family_cmds::search_article_families,
            commands::family_cmds::create_article_family,
            commands::family_cmds::update_article_family,
            commands::family_cmds::delete_article_family,
            commands::stock_cmds::get_stock_level,
            commands::stock_cmds::list_stock_movements,
            commands::stock_cmds::list_stock_reports,
            commands::stock_cmds::create_stock_movement,
            commands::stock_cmds::update_stock_movement,
            commands::stock_cmds::delete_stock_movement,
            commands::report_cmds::print_invoice,
            commands::report_cmds::print_receipt,
            commands::report_cmds::print_cheque,
            commands::report_cmds::print_document_variant,
            commands::report_cmds::get_x_report,
            commands::report_cmds::get_z_report,
            commands::report_cmds::get_sale_report_range,
            commands::report_cmds::list_report_catalog,
            commands::report_cmds::get_settlement_ledger,
            commands::report_cmds::get_stock_movement_report,
            commands::report_cmds::get_barcode_listing,
            commands::report_cmds::get_management_dashboard_report,
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
            commands::dashboard_cmds::get_dashboard_stats,
            commands::depot_cmds::list_depots,
            commands::depot_cmds::get_depot,
            commands::depot_cmds::search_depots,
            commands::depot_cmds::create_depot,
            commands::depot_cmds::update_depot,
            commands::depot_cmds::delete_depot,
            commands::bank_cmds::list_banks,
            commands::bank_cmds::get_bank,
            commands::bank_cmds::search_banks,
            commands::bank_cmds::create_bank,
            commands::bank_cmds::update_bank,
            commands::bank_cmds::delete_bank,
            commands::currency_cmds::list_currencies,
            commands::currency_cmds::get_currency,
            commands::currency_cmds::search_currencies,
            commands::currency_cmds::create_currency,
            commands::currency_cmds::update_currency,
            commands::currency_cmds::delete_currency,
            commands::country_cmds::list_countries,
            commands::country_cmds::get_country,
            commands::country_cmds::search_countries,
            commands::country_cmds::create_country,
            commands::country_cmds::update_country,
            commands::country_cmds::delete_country,
            commands::crm_cmds::get_partner_profile,
            commands::crm_cmds::upsert_partner_profile,
            commands::crm_cmds::get_partner_kpis,
            commands::crm_cmds::list_partner_followups,
            commands::crm_cmds::create_partner_followup,
            commands::crm_cmds::update_partner_followup_status,
            commands::crm_cmds::list_partner_reclamations,
            commands::crm_cmds::create_partner_reclamation,
            commands::crm_cmds::update_partner_reclamation_status,
            commands::payment_method_cmds::list_payment_methods,
            commands::payment_method_cmds::get_payment_method,
            commands::payment_method_cmds::search_payment_methods,
            commands::payment_method_cmds::create_payment_method,
            commands::payment_method_cmds::update_payment_method,
            commands::payment_method_cmds::delete_payment_method,
            commands::cashier_cmds::list_cashiers,
            commands::cashier_cmds::get_cashier,
            commands::cashier_cmds::search_cashiers,
            commands::cashier_cmds::create_cashier,
            commands::cashier_cmds::update_cashier,
            commands::cashier_cmds::delete_cashier,
            commands::register_cmds::list_registers,
            commands::register_cmds::get_register,
            commands::register_cmds::search_registers,
            commands::register_cmds::create_register,
            commands::register_cmds::update_register,
            commands::register_cmds::delete_register,
            commands::rayon_cmds::list_rayons,
            commands::rayon_cmds::get_rayon,
            commands::rayon_cmds::search_rayons,
            commands::rayon_cmds::create_rayon,
            commands::rayon_cmds::update_rayon,
            commands::rayon_cmds::delete_rayon,
            commands::gondola_cmds::list_gondolas,
            commands::gondola_cmds::get_gondola,
            commands::gondola_cmds::search_gondolas,
            commands::gondola_cmds::create_gondola,
            commands::gondola_cmds::update_gondola,
            commands::gondola_cmds::delete_gondola,
            commands::user_cmds::list_users,
            commands::user_cmds::list_roles,
            commands::user_cmds::login_user,
            commands::user_cmds::update_role_permissions,
            commands::wave6_cmds::backup_database,
            commands::wave6_cmds::restore_database_from_backup,
            commands::wave6_cmds::verify_database_health,
            commands::wave6_cmds::upload_fiscal_plu,
            commands::wave6_cmds::import_external_register_csv,
            commands::wave6_cmds::run_site_sync_now,
            commands::settings_cmds::get_app_settings,
            commands::settings_cmds::set_app_settings,
            commands::settings_cmds::list_document_series,
            commands::settings_cmds::update_document_series,
            commands::product_range_cmds::list_product_ranges,
            commands::product_range_cmds::get_product_range,
            commands::product_range_cmds::search_product_ranges,
            commands::product_range_cmds::create_product_range,
            commands::product_range_cmds::update_product_range,
            commands::product_range_cmds::delete_product_range,
            commands::tariff_category_cmds::list_tariff_categories,
            commands::tariff_category_cmds::get_tariff_category,
            commands::tariff_category_cmds::search_tariff_categories,
            commands::tariff_category_cmds::create_tariff_category,
            commands::tariff_category_cmds::update_tariff_category,
            commands::tariff_category_cmds::delete_tariff_category,
            commands::accounting_category_cmds::list_accounting_categories,
            commands::accounting_category_cmds::get_accounting_category,
            commands::accounting_category_cmds::search_accounting_categories,
            commands::accounting_category_cmds::create_accounting_category,
            commands::accounting_category_cmds::update_accounting_category,
            commands::accounting_category_cmds::delete_accounting_category,
            commands::advanced_tax_rate_cmds::list_advanced_tax_rates,
            commands::advanced_tax_rate_cmds::get_advanced_tax_rate,
            commands::advanced_tax_rate_cmds::search_advanced_tax_rates,
            commands::advanced_tax_rate_cmds::create_advanced_tax_rate,
            commands::advanced_tax_rate_cmds::update_advanced_tax_rate,
            commands::advanced_tax_rate_cmds::delete_advanced_tax_rate,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
