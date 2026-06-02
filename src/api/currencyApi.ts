import { invoke } from "@tauri-apps/api/core";
import type { Currency, CreateCurrency, UpdateCurrency } from "../types/currency";

export async function listCurrencies(): Promise<Currency[]> {
  return invoke("list_currencies");
}

export async function getCurrency(id: string): Promise<Currency> {
  return invoke("get_currency", { id });
}

export async function searchCurrencies(q: string): Promise<Currency[]> {
  return invoke("search_currencies", { q });
}

export async function createCurrency(cmd: CreateCurrency): Promise<Currency> {
  return invoke("create_currency", { cmd });
}

export async function updateCurrency(cmd: UpdateCurrency): Promise<Currency> {
  return invoke("update_currency", { cmd });
}

export async function deleteCurrency(id: string): Promise<void> {
  return invoke("delete_currency", { id });
}