import { describe, expect, it } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";

import * as articleApi from "@/api/articleApi";
import * as familyApi from "@/api/familyApi";
import * as unitApi from "@/api/unitOfMeasureApi";
import * as salespersonApi from "@/api/salespersonApi";
import * as depotApi from "@/api/depotApi";
import * as bankApi from "@/api/bankApi";
import * as currencyApi from "@/api/currencyApi";
import * as paymentMethodApi from "@/api/paymentMethodApi";
import * as cashierApi from "@/api/cashierApi";
import * as registerApi from "@/api/registerApi";
import * as rayonApi from "@/api/rayonApi";
import * as gondolaApi from "@/api/gondolaApi";
import * as productRangeApi from "@/api/productRangeApi";
import * as tariffCategoryApi from "@/api/tariffCategoryApi";
import * as accountingCategoryApi from "@/api/accountingCategoryApi";
import * as advancedTaxRateApi from "@/api/advancedTaxRateApi";
import * as countryApi from "@/api/countryApi";
import * as partnerApi from "@/api/partnerApi";
import * as articleCodeApi from "@/api/articleCodeApi";
import * as bomApi from "@/api/bomApi";
import * as documentApi from "@/api/documentApi";
import * as stockApi from "@/api/stockApi";
import * as crmApi from "@/api/crmApi";
import * as userApi from "@/api/userApi";
import * as settingsApi from "@/api/settingsApi";
import * as reportApi from "@/api/reportApi";
import * as dashboardApi from "@/api/dashboardApi";
import * as posApi from "@/api/posApi";

type IpcCall = { cmd: string; args: unknown };

function setupIpcCapture() {
  const calls: IpcCall[] = [];
  mockIPC((cmd, args) => {
    calls.push({ cmd, args });
    const payload = (args as Record<string, unknown> | undefined) ?? {};
    const recordCmd = typeof cmd === "string" ? cmd : "";

    if (recordCmd === "get_stock_level") {
      return { article_id: "a1", depot_id: "d1", quantity: 0 };
    }
    if (recordCmd === "list_stock_movements") {
      return [];
    }
    if (recordCmd === "create_stock_movement" || recordCmd === "update_stock_movement") {
      const cmdArg = (payload.cmd as Record<string, unknown>) ?? {};
      return {
        id: "mv_1",
        movement_type: cmdArg.movement_type ?? "entry",
        article_id: cmdArg.article_id ?? "a1",
        depot_id: cmdArg.source_depot_id ?? cmdArg.destination_depot_id ?? "d1",
        target_depot_id: cmdArg.destination_depot_id ?? null,
        quantity: cmdArg.quantity ?? 1,
        reference: cmdArg.reference ?? "",
        notes: cmdArg.notes ?? "",
        created_at: new Date().toISOString(),
      };
    }
    if (recordCmd.startsWith("list_") || recordCmd.startsWith("search_")) return [];
    if (recordCmd.startsWith("get_")) return {};
    if (recordCmd.startsWith("create_") || recordCmd.startsWith("update_")) {
      return (payload.cmd ?? {}) as object;
    }
    return null;
  });
  return calls;
}

describe("API CRUD command wiring", () => {
  it("maps CRUD API functions to expected tauri commands", async () => {
    const calls = setupIpcCapture();
    const run = async (expected: string, fn: () => Promise<unknown>) => {
      const before = calls.length;
      await fn();
      expect(calls.length).toBe(before + 1);
      expect(calls.at(-1)?.cmd).toBe(expected);
    };

    // Article
    await run("list_articles", () => articleApi.listArticles());
    await run("get_article", () => articleApi.getArticle("a1"));
    await run("search_articles", () => articleApi.searchArticles("cola"));
    await run("create_article", () => articleApi.createArticle({ code: "A", name: "A" } as never));
    await run("update_article", () => articleApi.updateArticle({ id: "a1" } as never));
    await run("delete_article", () => articleApi.deleteArticle("a1"));

    // Family
    await run("list_article_families", () => familyApi.listArticleFamilies());
    await run("get_article_family", () => familyApi.getArticleFamily("f1"));
    await run("search_article_families", () => familyApi.searchArticleFamilies("fam"));
    await run("create_article_family", () => familyApi.createArticleFamily({ name: "F" } as never));
    await run("update_article_family", () => familyApi.updateArticleFamily({ id: "f1" } as never));
    await run("delete_article_family", () => familyApi.deleteArticleFamily("f1"));

    // Unit
    await run("list_units_of_measure", () => unitApi.listUnitsOfMeasure());
    await run("get_unit_of_measure", () => unitApi.getUnitOfMeasure("u1"));
    await run("search_units_of_measure", () => unitApi.searchUnitsOfMeasure("kg"));
    await run("create_unit_of_measure", () => unitApi.createUnitOfMeasure({ name: "KG" } as never));
    await run("update_unit_of_measure", () => unitApi.updateUnitOfMeasure({ id: "u1" } as never));
    await run("delete_unit_of_measure", () => unitApi.deleteUnitOfMeasure("u1"));

    // Salesperson
    await run("list_salespersons", () => salespersonApi.listSalespersons());
    await run("get_salesperson", () => salespersonApi.getSalesperson("s1"));
    await run("search_salespersons", () => salespersonApi.searchSalespersons("ali"));
    await run("create_salesperson", () => salespersonApi.createSalesperson({ code: "S" } as never));
    await run("update_salesperson", () => salespersonApi.updateSalesperson({ id: "s1" } as never));
    await run("delete_salesperson", () => salespersonApi.deleteSalesperson("s1"));

    // Depot / bank / currency / payment
    await run("list_depots", () => depotApi.listDepots());
    await run("get_depot", () => depotApi.getDepot("d1"));
    await run("search_depots", () => depotApi.searchDepots("dep"));
    await run("create_depot", () => depotApi.createDepot({ code: "D" } as never));
    await run("update_depot", () => depotApi.updateDepot({ id: "d1" } as never));
    await run("delete_depot", () => depotApi.deleteDepot("d1"));
    await run("list_banks", () => bankApi.listBanks());
    await run("get_bank", () => bankApi.getBank("b1"));
    await run("search_banks", () => bankApi.searchBanks("bank"));
    await run("create_bank", () => bankApi.createBank({ code: "B" } as never));
    await run("update_bank", () => bankApi.updateBank({ id: "b1" } as never));
    await run("delete_bank", () => bankApi.deleteBank("b1"));
    await run("list_currencies", () => currencyApi.listCurrencies());
    await run("get_currency", () => currencyApi.getCurrency("c1"));
    await run("search_currencies", () => currencyApi.searchCurrencies("TND"));
    await run("create_currency", () => currencyApi.createCurrency({ code: "TND" } as never));
    await run("update_currency", () => currencyApi.updateCurrency({ id: "c1" } as never));
    await run("delete_currency", () => currencyApi.deleteCurrency("c1"));
    await run("list_payment_methods", () => paymentMethodApi.listPaymentMethods());
    await run("get_payment_method", () => paymentMethodApi.getPaymentMethod("pm1"));
    await run("search_payment_methods", () => paymentMethodApi.searchPaymentMethods("cash"));
    await run("create_payment_method", () => paymentMethodApi.createPaymentMethod({ code: "PM" } as never));
    await run("update_payment_method", () => paymentMethodApi.updatePaymentMethod({ id: "pm1" } as never));
    await run("delete_payment_method", () => paymentMethodApi.deletePaymentMethod("pm1"));

    // Cashier / register / rayon / gondola
    await run("list_cashiers", () => cashierApi.listCashiers());
    await run("get_cashier", () => cashierApi.getCashier("c1"));
    await run("search_cashiers", () => cashierApi.searchCashiers("cash"));
    await run("create_cashier", () => cashierApi.createCashier({ code: "C" } as never));
    await run("update_cashier", () => cashierApi.updateCashier({ id: "c1" } as never));
    await run("delete_cashier", () => cashierApi.deleteCashier("c1"));
    await run("list_registers", () => registerApi.listRegisters());
    await run("get_register", () => registerApi.getRegister("r1"));
    await run("search_registers", () => registerApi.searchRegisters("reg"));
    await run("create_register", () => registerApi.createRegister({ code: "R" } as never));
    await run("update_register", () => registerApi.updateRegister({ id: "r1" } as never));
    await run("delete_register", () => registerApi.deleteRegister("r1"));
    await run("list_rayons", () => rayonApi.listRayons());
    await run("get_rayon", () => rayonApi.getRayon("ry1"));
    await run("search_rayons", () => rayonApi.searchRayons("ray"));
    await run("create_rayon", () => rayonApi.createRayon({ code: "RAY" } as never));
    await run("update_rayon", () => rayonApi.updateRayon({ id: "ry1" } as never));
    await run("delete_rayon", () => rayonApi.deleteRayon("ry1"));
    await run("list_gondolas", () => gondolaApi.listGondolas());
    await run("get_gondola", () => gondolaApi.getGondola("g1"));
    await run("search_gondolas", () => gondolaApi.searchGondolas("gon"));
    await run("create_gondola", () => gondolaApi.createGondola({ code: "GON" } as never));
    await run("update_gondola", () => gondolaApi.updateGondola({ id: "g1" } as never));
    await run("delete_gondola", () => gondolaApi.deleteGondola("g1"));

    // Product/tariff/accounting/tax/country
    await run("list_product_ranges", () => productRangeApi.listProductRanges());
    await run("get_product_range", () => productRangeApi.getProductRange("pr1"));
    await run("search_product_ranges", () => productRangeApi.searchProductRanges("range"));
    await run("create_product_range", () => productRangeApi.createProductRange({ code: "PR" } as never));
    await run("update_product_range", () => productRangeApi.updateProductRange({ id: "pr1" } as never));
    await run("delete_product_range", () => productRangeApi.deleteProductRange("pr1"));
    await run("list_tariff_categories", () => tariffCategoryApi.listTariffCategories());
    await run("get_tariff_category", () => tariffCategoryApi.getTariffCategory("tc1"));
    await run("search_tariff_categories", () => tariffCategoryApi.searchTariffCategories("tariff"));
    await run("create_tariff_category", () => tariffCategoryApi.createTariffCategory({ code: "TC" } as never));
    await run("update_tariff_category", () => tariffCategoryApi.updateTariffCategory({ id: "tc1" } as never));
    await run("delete_tariff_category", () => tariffCategoryApi.deleteTariffCategory("tc1"));
    await run("list_accounting_categories", () => accountingCategoryApi.listAccountingCategories());
    await run("get_accounting_category", () => accountingCategoryApi.getAccountingCategory("ac1"));
    await run("search_accounting_categories", () => accountingCategoryApi.searchAccountingCategories("acc"));
    await run("create_accounting_category", () => accountingCategoryApi.createAccountingCategory({ code: "AC" } as never));
    await run("update_accounting_category", () => accountingCategoryApi.updateAccountingCategory({ id: "ac1" } as never));
    await run("delete_accounting_category", () => accountingCategoryApi.deleteAccountingCategory("ac1"));
    await run("list_advanced_tax_rates", () => advancedTaxRateApi.listAdvancedTaxRates());
    await run("get_advanced_tax_rate", () => advancedTaxRateApi.getAdvancedTaxRate("at1"));
    await run("search_advanced_tax_rates", () => advancedTaxRateApi.searchAdvancedTaxRates("tax"));
    await run("create_advanced_tax_rate", () => advancedTaxRateApi.createAdvancedTaxRate({ code: "AT" } as never));
    await run("update_advanced_tax_rate", () => advancedTaxRateApi.updateAdvancedTaxRate({ id: "at1" } as never));
    await run("delete_advanced_tax_rate", () => advancedTaxRateApi.deleteAdvancedTaxRate("at1"));
    await run("list_countries", () => countryApi.listCountries());
    await run("get_country", () => countryApi.getCountry("ct1"));
    await run("search_countries", () => countryApi.searchCountries("tun"));
    await run("create_country", () => countryApi.createCountry({ code: "TN" } as never));
    await run("update_country", () => countryApi.updateCountry({ id: "ct1" } as never));
    await run("delete_country", () => countryApi.deleteCountry("ct1"));

    // Partner (available operations)
    await run("list_partners", () => partnerApi.listPartners("client"));
    await run("get_partner", () => partnerApi.getPartner("p1"));
    await run("search_partners", () => partnerApi.searchPartners("cli"));
    await run("create_partner", () => partnerApi.createPartner({ code: "CL", partner_type: "client" } as never));

    // Article code and BOM
    await run("list_article_codes", () => articleCodeApi.listArticleCodes("a1"));
    await run("search_article_codes", () => articleCodeApi.searchArticleCodes("bar"));
    await run("create_article_code", () => articleCodeApi.createArticleCode({ article_id: "a1" } as never));
    await run("delete_article_code", () => articleCodeApi.deleteArticleCode("ac1"));
    await run("list_article_bom_headers", () => bomApi.listArticleBomHeaders("a1"));
    await run("create_article_bom_header", () => bomApi.createArticleBomHeader({ parent_article_id: "a1" } as never));
    await run("set_article_bom_header_active", () => bomApi.setArticleBomHeaderActive("bh1", true));
    await run("list_article_bom_lines", () => bomApi.listArticleBomLines("bh1"));
    await run("create_article_bom_line", () => bomApi.createArticleBomLine({ bom_id: "bh1" } as never));
    await run("delete_article_bom_line", () => bomApi.deleteArticleBomLine("bl1"));

    // Document lifecycle
    await run("list_documents", () => documentApi.listDocuments("invoice"));
    await run("get_document", () => documentApi.getDocument("d1"));
    await run("get_document_lines", () => documentApi.getDocumentLines("d1"));
    await run("create_document", () => documentApi.createDocument({ doc_type: "invoice", lines: [] } as never));
    await run("transform_document", () => documentApi.transformDocument("d1", "order"));
    await run("confirm_document", () => documentApi.confirmDocument("d1"));
    await run("set_document_status", () => documentApi.setDocumentStatus("d1", "paid"));

    // Stock movement backend CRUD endpoints
    await run("get_stock_level", () => stockApi.getStockLevel("a1"));
    await run("list_stock_movements", () => stockApi.listStockMovements("a1"));
    await run("create_stock_movement", () => stockApi.createStockMovement({
      article_id: "a1",
      source_depot_id: "d1",
      destination_depot_id: "d2",
      quantity: 1,
      movement_type: "transfer",
      reference: "",
      notes: "",
    }));
    await run("update_stock_movement", () => stockApi.updateStockMovement({
      id: "m1",
      article_id: "a1",
      source_depot_id: "d1",
      destination_depot_id: "d2",
      quantity: 2,
      movement_type: "transfer",
      reference: "",
      notes: "",
    }));
    await run("delete_stock_movement", () => stockApi.deleteStockMovement("m1"));
    await run("list_stock_reports", () => stockApi.listStockReports({}));

    // CRM and user ops that include update/create-like behaviors
    await run("get_partner_profile", () => crmApi.getPartnerProfile("p1"));
    await run("get_partner_kpis", () => crmApi.getPartnerKpis("p1"));
    await run("upsert_partner_profile", () => crmApi.upsertPartnerProfile({ partner_id: "p1" } as never));
    await run("list_partner_followups", () => crmApi.listPartnerFollowups("p1"));
    await run("create_partner_followup", () => crmApi.createPartnerFollowup({ partner_id: "p1" } as never));
    await run("update_partner_followup_status", () => crmApi.updatePartnerFollowupStatus({ id: "f1", status: "done" }));
    await run("list_partner_reclamations", () => crmApi.listPartnerReclamations("p1"));
    await run("create_partner_reclamation", () => crmApi.createPartnerReclamation({ title: "t" } as never));
    await run("update_partner_reclamation_status", () => crmApi.updatePartnerReclamationStatus({ id: "r1", status: "closed" }));
    await run("list_users", () => userApi.listUsers());
    await run("list_roles", () => userApi.listRoles());
    await run("update_role_permissions", () => userApi.updateRolePermissions({ role_id: "manager", permissions: [] }));

    // Settings / POS read-update surfaces
    await run("get_app_settings", () => settingsApi.getAppSettings(["company_name"]));
    await run("set_app_settings", () => settingsApi.setAppSettings({ company_name: "FIRST MAG" }));
    await run("list_document_series", () => settingsApi.listDocumentSeries());
    await run("update_document_series", () => settingsApi.updateDocumentSeries({ id: "invoice", prefix: "FAC", next_number: 1, format: "" } as never));
    await run("get_session_cash_summary", () => posApi.getSessionCashSummary("s1"));
    await run("list_session_cash_totals", () => posApi.listSessionCashTotals("2026-01-01", "2026-12-31"));

    // Report/dashboard getters (read operations used by app)
    await run("get_dashboard_stats", () => dashboardApi.getDashboardStats());
    await run("get_x_report", () => reportApi.getXReport());
    await run("get_z_report", () => reportApi.getZReport());
    await run("get_sale_report_range", () => reportApi.getSaleReportRange("2026-01-01", "2026-12-31"));
    await run("list_report_catalog", () => reportApi.listReportCatalog());
    await run("get_settlement_ledger", () => reportApi.getSettlementLedger("2026-01-01", "2026-12-31"));
    await run("get_stock_movement_report", () => reportApi.getStockMovementReport("2026-01-01", "2026-12-31"));
    await run("get_barcode_listing", () => reportApi.getBarcodeListing());
    await run("get_management_dashboard_report", () => reportApi.getManagementDashboardReport("2026-01-01", "2026-12-31"));
  });

  it("executes local stock verification and barcode import CRUD flows", async () => {
    const verification = await stockApi.createStockVerification({
      depot_id: "d1",
      verification_date: "2026-06-03",
      notes: "n",
      lines: [{ article_id: "a1", quantity: 10, theoretical_quantity: 8 }],
    });
    const verifs = await stockApi.listStockVerifications();
    expect(verifs.some((v) => v.id === verification.id)).toBe(true);
    await stockApi.updateStockVerification(verification.id, {
      depot_id: "d1",
      verification_date: "2026-06-04",
      notes: "u",
      lines: [{ article_id: "a1", quantity: 12, theoretical_quantity: 10 }],
    });
    await stockApi.confirmStockVerification(verification.id);
    await stockApi.deleteStockVerification(verification.id);
    expect((await stockApi.listStockVerifications()).some((v) => v.id === verification.id)).toBe(
      false,
    );

    const barcodeImport = await stockApi.createBarcodeImport({
      depot_id: "d1",
      import_date: "2026-06-03",
      reference: "ref",
      notes: "n",
      lines: [{ barcode: "111", quantity: 1 }],
    });
    expect((await stockApi.listBarcodeImports()).some((v) => v.id === barcodeImport.id)).toBe(true);
    await stockApi.updateBarcodeImport(barcodeImport.id, {
      depot_id: "d1",
      import_date: "2026-06-05",
      reference: "ref2",
      notes: "u",
      lines: [{ barcode: "111", quantity: 2 }],
    });
    await stockApi.confirmBarcodeImport(barcodeImport.id);
    await stockApi.deleteBarcodeImport(barcodeImport.id);
    expect((await stockApi.listBarcodeImports()).some((v) => v.id === barcodeImport.id)).toBe(false);
  });
});
