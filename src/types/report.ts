export interface SaleReport {
  period_start: string;
  period_end: string;
  total_transactions: number;
  total_quantity: number;
  total_ht: number;
  total_tax: number;
  total_ttc: number;
  cash_total: number;
  card_total: number;
  cheque_total: number;
  transfer_total: number;
  session_id: string | null;
}

export interface ReportCatalogItem {
  id: string;
  title: string;
  legacy_label: string;
  category: string;
}

export interface SettlementLedgerRow {
  ticket_id: string;
  mode: string;
  amount: number;
  reference: string;
  created_at: string;
}

export interface StockMovementReportRow {
  movement_type: string;
  article_id: string;
  article_name: string;
  depot_id: string;
  quantity: number;
  reference: string;
  created_at: string;
}

export interface BarcodeReportRow {
  article_id: string;
  article_code: string;
  article_name: string;
  barcode: string;
  alt_code: string | null;
  alt_code_type: string | null;
}

export interface TurnoverPoint {
  period: string;
  total_ttc: number;
  doc_count: number;
}

export interface PartnerAnalysisRow {
  partner_id: string;
  partner_name: string;
  partner_type: string;
  total_ttc: number;
  invoice_count: number;
  balance: number;
}

export interface ManagementDashboardReport {
  turnover_evolution: TurnoverPoint[];
  top_clients: PartnerAnalysisRow[];
  top_suppliers: PartnerAnalysisRow[];
  stock_total_quantity: number;
  stock_entries: number;
  stock_exits: number;
  cash_in_total: number;
  cash_out_total: number;
}
