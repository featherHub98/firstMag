import { invoke } from "@tauri-apps/api/core";
import type { AdvancedTaxRate, CreateAdvancedTaxRate, UpdateAdvancedTaxRate } from "../types/advancedTaxRate";

export async function listAdvancedTaxRates(): Promise<AdvancedTaxRate[]> {
  return invoke("list_advanced_tax_rates");
}

export async function getAdvancedTaxRate(id: string): Promise<AdvancedTaxRate> {
  return invoke("get_advanced_tax_rate", { id });
}

export async function searchAdvancedTaxRates(q: string): Promise<AdvancedTaxRate[]> {
  return invoke("search_advanced_tax_rates", { q });
}

export async function createAdvancedTaxRate(cmd: CreateAdvancedTaxRate): Promise<AdvancedTaxRate> {
  return invoke("create_advanced_tax_rate", { cmd });
}

export async function updateAdvancedTaxRate(cmd: UpdateAdvancedTaxRate): Promise<AdvancedTaxRate> {
  return invoke("update_advanced_tax_rate", { cmd });
}

export async function deleteAdvancedTaxRate(id: string): Promise<void> {
  return invoke("delete_advanced_tax_rate", { id });
}
