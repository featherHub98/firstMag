import { invoke } from "@tauri-apps/api/core";
import type { Cashier, CreateCashier, UpdateCashier } from "../types/cashier";

export async function listCashiers(): Promise<Cashier[]> {
  return invoke("list_cashiers");
}

export async function getCashier(id: string): Promise<Cashier> {
  return invoke("get_cashier", { id });
}

export async function searchCashiers(q: string): Promise<Cashier[]> {
  return invoke("search_cashiers", { q });
}

export async function createCashier(cmd: CreateCashier): Promise<Cashier> {
  return invoke("create_cashier", { cmd });
}

export async function updateCashier(cmd: UpdateCashier): Promise<Cashier> {
  return invoke("update_cashier", { cmd });
}

export async function deleteCashier(id: string): Promise<void> {
  return invoke("delete_cashier", { id });
}
