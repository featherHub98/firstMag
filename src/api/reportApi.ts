import { invoke } from "@tauri-apps/api/core";
import type {
  BarcodeReportRow,
  ManagementDashboardReport,
  ReportCatalogItem,
  SaleReport,
  SettlementLedgerRow,
  StockMovementReportRow,
} from "../types";

export async function getXReport(): Promise<SaleReport> {
  return invoke("get_x_report");
}

export async function getZReport(): Promise<SaleReport> {
  return invoke("get_z_report");
}

export async function getSaleReportRange(since: string, until: string): Promise<SaleReport> {
  return invoke("get_sale_report_range", { since, until });
}

export async function listReportCatalog(): Promise<ReportCatalogItem[]> {
  return invoke("list_report_catalog");
}

export async function getSettlementLedger(
  since: string,
  until: string,
  mode?: string,
): Promise<SettlementLedgerRow[]> {
  return invoke("get_settlement_ledger", { since, until, mode });
}

export async function getStockMovementReport(
  since: string,
  until: string,
): Promise<StockMovementReportRow[]> {
  return invoke("get_stock_movement_report", { since, until });
}

export async function getBarcodeListing(): Promise<BarcodeReportRow[]> {
  return invoke("get_barcode_listing");
}

export async function getManagementDashboardReport(
  since: string,
  until: string,
): Promise<ManagementDashboardReport> {
  return invoke("get_management_dashboard_report", { since, until });
}

export async function printReport(title: string): Promise<void> {
  return invoke("print_report", { title });
}

export async function printDocumentVariant(docId: string, variant: string): Promise<void> {
  return invoke("print_document_variant", { docId, variant });
}
