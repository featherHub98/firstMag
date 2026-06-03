import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks";
import { useSessionStore } from "@/stores/sessionStore";
import { useUiStore } from "@/stores/uiStore";

type AnyRecord = Record<string, unknown>;

function dashboardStats() {
  return {
    total_articles: 20,
    priced_articles: 20,
    total_clients: 10,
    total_documents: 5,
    stock_value_pa: 200_000,
    stock_value_pv: 280_000,
    recent_documents: [],
  };
}

function saleReport() {
  return {
    period_start: "2026-01-01",
    period_end: "2026-01-31",
    total_transactions: 3,
    total_quantity: 12,
    total_ht: 10_000,
    total_tax: 1_900,
    total_ttc: 11_900,
    cash_total: 7_000,
    card_total: 3_000,
    cheque_total: 1_000,
    transfer_total: 900,
  };
}

function managementDashboardReport() {
  return {
    top_clients: [],
    top_suppliers: [],
    turnover_evolution: [],
    stock_total_quantity: 0,
    cash_in_total: 0,
    cash_out_total: 0,
  };
}

function routeFallback(cmd: string, args?: AnyRecord): unknown {
  if (cmd === "get_dashboard_stats") return dashboardStats();
  if (cmd === "get_open_session") return null;
  if (cmd === "get_x_report" || cmd === "get_z_report" || cmd === "get_sale_report_range") return saleReport();
  if (cmd === "get_settlement_ledger") return [];
  if (cmd === "get_stock_movement_report") return [];
  if (cmd === "get_barcode_listing") return [];
  if (cmd === "get_management_dashboard_report") return managementDashboardReport();
  if (cmd === "verify_database_health") return { ok: true, checks: [] };
  if (cmd === "list_report_catalog") return [];
  if (cmd === "list_roles") return [];
  if (cmd === "list_users") return [];
  if (cmd === "list_documents") return [];
  if (cmd === "get_document_lines") return [];
  if (cmd === "get_stock_level") {
    return {
      article_id: String(args?.article_id ?? ""),
      depot_id: "main",
      quantity: 0,
    };
  }
  if (cmd.startsWith("list_") || cmd.startsWith("search_")) return [];
  if (cmd.startsWith("get_")) return {};
  if (cmd.startsWith("create_") || cmd.startsWith("update_")) {
    return (args?.cmd ?? {}) as object;
  }
  if (cmd.startsWith("delete_")) return null;
  if (cmd.startsWith("print_")) return null;
  if (cmd === "open_session") return { id: "s_test", status: "open", opening_fund: 0 };
  if (cmd === "close_session") return { id: "s_test", status: "closed", closing_fund: 0 };
  if (cmd === "new_ticket") return { id: "t_test", ticket_number: 1, status: "active" };
  return null;
}

beforeEach(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  clearMocks();
  mockIPC((cmd, args) => routeFallback(cmd, args as AnyRecord));

  useSessionStore.getState().clear();
  useSessionStore.getState().setUser("1", "Admin Test", "admin", ["*"]);
  useSessionStore.getState().setRegisterOpen(true, "s_test", 0);

  useUiStore.setState({
    loginOpen: false,
    migrationTips: false,
  });
});
