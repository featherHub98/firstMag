import { invoke } from "@tauri-apps/api/core";
import type { CreateTariffCategory, TariffCategory, UpdateTariffCategory } from "../types/tariffCategory";

export async function listTariffCategories(): Promise<TariffCategory[]> {
  return invoke("list_tariff_categories");
}

export async function getTariffCategory(id: string): Promise<TariffCategory> {
  return invoke("get_tariff_category", { id });
}

export async function searchTariffCategories(q: string): Promise<TariffCategory[]> {
  return invoke("search_tariff_categories", { q });
}

export async function createTariffCategory(cmd: CreateTariffCategory): Promise<TariffCategory> {
  return invoke("create_tariff_category", { cmd });
}

export async function updateTariffCategory(cmd: UpdateTariffCategory): Promise<TariffCategory> {
  return invoke("update_tariff_category", { cmd });
}

export async function deleteTariffCategory(id: string): Promise<void> {
  return invoke("delete_tariff_category", { id });
}
