use crate::domain::{
    BarcodeReportRow, DomainResult, ManagementDashboardReport, PartnerAnalysisRow, ReportCatalogItem,
    SaleReport, SettlementLedgerRow, StockMovementReportRow, TurnoverPoint,
};
use chrono::Utc;
use sqlx::{Row, SqlitePool};

pub async fn sales_summary(pool: &SqlitePool, since: &str, until: &str) -> DomainResult<SaleReport> {
    let row = sqlx::query(
        "SELECT
            COALESCE(COUNT(*), 0) as total_transactions,
            COALESCE(SUM(total_ht), 0) as total_ht,
            COALESCE(SUM(total_tax), 0) as total_tax,
            COALESCE(SUM(total_ttc), 0) as total_ttc
         FROM documents
         WHERE doc_type = 'invoice'
           AND status != 'cancelled'
           AND created_at >= ? AND created_at <= ?",
    )
    .bind(&since)
    .bind(&until)
    .fetch_one(pool)
    .await?;

    let qty_row = sqlx::query(
        "SELECT COALESCE(SUM(quantity), 0) as qty
         FROM document_lines dl
         JOIN documents d ON d.id = dl.document_id
         WHERE d.doc_type = 'invoice'
           AND d.status != 'cancelled'
           AND d.created_at >= ? AND d.created_at <= ?",
    )
    .bind(&since)
    .bind(&until)
    .fetch_one(pool)
    .await?;

    let payment_rows = sqlx::query(
        "SELECT mode, COALESCE(SUM(amount), 0) as total
         FROM payments p
         JOIN pos_tickets t ON t.id = p.ticket_id
         WHERE t.created_at >= ? AND t.created_at <= ?
         GROUP BY mode",
    )
    .bind(&since)
    .bind(&until)
    .fetch_all(pool)
    .await?;

    let mut cash_total = 0_i64;
    let mut card_total = 0_i64;
    let mut cheque_total = 0_i64;
    let mut transfer_total = 0_i64;
    for row in payment_rows {
        let mode: String = row.get(0);
        let total: i64 = row.get(1);
        match mode.as_str() {
            "cash" => cash_total = total,
            "card" => card_total = total,
            "cheque" => cheque_total = total,
            "transfer" => transfer_total = total,
            _ => {}
        }
    }

    Ok(SaleReport {
        period_start: since.to_string(),
        period_end: until.to_string(),
        total_transactions: row.get(0),
        total_ht: row.get(1),
        total_tax: row.get(2),
        total_ttc: row.get(3),
        total_quantity: qty_row.get(0),
        cash_total,
        card_total,
        cheque_total,
        transfer_total,
        session_id: None,
    })
}

pub fn report_catalog() -> Vec<ReportCatalogItem> {
    vec![
        ReportCatalogItem { id: "sales_docs".into(), title: "Impression documents de vente".into(), legacy_label: "ETAT VENTES".into(), category: "documents".into() },
        ReportCatalogItem { id: "purchase_docs".into(), title: "Impression documents d'achat".into(), legacy_label: "ETAT ACHATS".into(), category: "documents".into() },
        ReportCatalogItem { id: "returns_docs".into(), title: "Impression retours".into(), legacy_label: "ETAT RETOURS".into(), category: "documents".into() },
        ReportCatalogItem { id: "periodic_invoice".into(), title: "Factures periodiques".into(), legacy_label: "FACTURES PERIODIQUES".into(), category: "documents".into() },
        ReportCatalogItem { id: "settlement_ledger".into(), title: "Journal des reglements".into(), legacy_label: "ETAT REGLEMENTS".into(), category: "settlements".into() },
        ReportCatalogItem { id: "cheque_ledger".into(), title: "Journal des cheques".into(), legacy_label: "ETAT CHEQUES".into(), category: "settlements".into() },
        ReportCatalogItem { id: "stock_movement".into(), title: "Mouvements de stock".into(), legacy_label: "ETAT MVT STOCK".into(), category: "stock".into() },
        ReportCatalogItem { id: "barcode_listing".into(), title: "Listing codes-barres / PLU".into(), legacy_label: "ETAT CODEABARRE".into(), category: "stock".into() },
        ReportCatalogItem { id: "dashboard_management".into(), title: "Analyse pilotage".into(), legacy_label: "REQUETES GESTION".into(), category: "analysis".into() },
    ]
}

pub async fn settlement_ledger(
    pool: &SqlitePool,
    since: &str,
    until: &str,
    mode: Option<&str>,
) -> DomainResult<Vec<SettlementLedgerRow>> {
    let rows = if let Some(m) = mode {
        sqlx::query_as::<_, SettlementLedgerRow>(
            "SELECT p.ticket_id, p.mode, p.amount, p.reference, t.created_at
             FROM payments p
             JOIN pos_tickets t ON t.id = p.ticket_id
             WHERE p.mode = ? AND t.created_at >= ? AND t.created_at <= ?
             ORDER BY t.created_at DESC",
        )
        .bind(&m)
        .bind(&since)
        .bind(&until)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, SettlementLedgerRow>(
            "SELECT p.ticket_id, p.mode, p.amount, p.reference, t.created_at
             FROM payments p
             JOIN pos_tickets t ON t.id = p.ticket_id
             WHERE t.created_at >= ? AND t.created_at <= ?
             ORDER BY t.created_at DESC",
        )
        .bind(&since)
        .bind(&until)
        .fetch_all(pool)
        .await?
    };
    Ok(rows)
}

pub async fn stock_movement_report(
    pool: &SqlitePool,
    since: &str,
    until: &str,
) -> DomainResult<Vec<StockMovementReportRow>> {
    sqlx::query_as::<_, StockMovementReportRow>(
        "SELECT m.movement_type, m.article_id, a.name as article_name, m.depot_id, m.quantity, m.reference, m.created_at
         FROM stock_movements m
         LEFT JOIN articles a ON a.id = m.article_id
         WHERE m.created_at >= ? AND m.created_at <= ?
         ORDER BY m.created_at DESC",
    )
    .bind(&since)
    .bind(&until)
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

pub async fn barcode_listing(pool: &SqlitePool) -> DomainResult<Vec<BarcodeReportRow>> {
    sqlx::query_as::<_, BarcodeReportRow>(
        "SELECT a.id as article_id, a.code as article_code, a.name as article_name, a.barcode,
                ac.code as alt_code, ac.code_type as alt_code_type
         FROM articles a
         LEFT JOIN article_codes ac ON ac.article_id = a.id
         ORDER BY a.name, ac.code",
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

pub async fn management_dashboard(
    pool: &SqlitePool,
    since: &str,
    until: &str,
) -> DomainResult<ManagementDashboardReport> {
    let turnover_rows = sqlx::query(
        "SELECT substr(created_at, 1, 10) as period, COALESCE(SUM(total_ttc),0) as total_ttc, COUNT(*) as doc_count
         FROM documents
         WHERE doc_type='invoice' AND status != 'cancelled' AND created_at >= ? AND created_at <= ?
         GROUP BY substr(created_at, 1, 10)
         ORDER BY period ASC",
    )
    .bind(&since)
    .bind(&until)
    .fetch_all(pool)
    .await?;
    let turnover_evolution = turnover_rows
        .into_iter()
        .map(|r| TurnoverPoint {
            period: r.get::<String, _>(0),
            total_ttc: r.get::<i64, _>(1),
            doc_count: r.get::<i64, _>(2),
        })
        .collect::<Vec<_>>();

    let top_clients = sqlx::query(
        "SELECT p.id, p.name, p.partner_type, COALESCE(SUM(d.total_ttc),0) as total_ttc, COUNT(d.id) as invoice_count, p.balance
         FROM partners p
         LEFT JOIN documents d ON d.partner_id = p.id AND d.doc_type='invoice' AND d.status!='cancelled'
         WHERE p.partner_type='client'
         GROUP BY p.id, p.name, p.partner_type, p.balance
         ORDER BY total_ttc DESC
         LIMIT 10",
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|r| PartnerAnalysisRow {
        partner_id: r.get(0),
        partner_name: r.get(1),
        partner_type: r.get(2),
        total_ttc: r.get(3),
        invoice_count: r.get(4),
        balance: r.get(5),
    })
    .collect::<Vec<_>>();

    let top_suppliers = sqlx::query(
        "SELECT p.id, p.name, p.partner_type, COALESCE(SUM(d.total_ttc),0) as total_ttc, COUNT(d.id) as invoice_count, p.balance
         FROM partners p
         LEFT JOIN documents d ON d.partner_id = p.id AND d.doc_type='purchase_invoice' AND d.status!='cancelled'
         WHERE p.partner_type='supplier'
         GROUP BY p.id, p.name, p.partner_type, p.balance
         ORDER BY total_ttc DESC
         LIMIT 10",
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|r| PartnerAnalysisRow {
        partner_id: r.get(0),
        partner_name: r.get(1),
        partner_type: r.get(2),
        total_ttc: r.get(3),
        invoice_count: r.get(4),
        balance: r.get(5),
    })
    .collect::<Vec<_>>();

    let stock_row = sqlx::query(
        "SELECT
            COALESCE(SUM(CASE WHEN movement_type='entry' THEN quantity ELSE 0 END),0),
            COALESCE(SUM(CASE WHEN movement_type='exit' THEN quantity ELSE 0 END),0)
         FROM stock_movements
         WHERE created_at >= ? AND created_at <= ?",
    )
    .bind(&since)
    .bind(&until)
    .fetch_one(pool)
    .await?;
    let stock_entries: i64 = stock_row.get(0);
    let stock_exits: i64 = stock_row.get(1);
    let stock_total_quantity = stock_entries - stock_exits;

    let cash_row = sqlx::query(
        "SELECT
            COALESCE(SUM(CASE WHEN movement_type='in' THEN amount ELSE 0 END),0),
            COALESCE(SUM(CASE WHEN movement_type='out' THEN amount ELSE 0 END),0)
         FROM cash_movements
         WHERE created_at >= ? AND created_at <= ?",
    )
    .bind(&since)
    .bind(&until)
    .fetch_one(pool)
    .await?;
    let cash_in_total: i64 = cash_row.get(0);
    let cash_out_total: i64 = cash_row.get(1);

    Ok(ManagementDashboardReport {
        turnover_evolution,
        top_clients,
        top_suppliers,
        stock_total_quantity,
        stock_entries,
        stock_exits,
        cash_in_total,
        cash_out_total,
    })
}

pub fn today_range() -> (String, String) {
    let now = Utc::now();
    let start = now
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap()
        .and_utc()
        .format("%Y-%m-%dT00:00:00Z")
        .to_string();
    let end = now.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
    (start, end)
}

