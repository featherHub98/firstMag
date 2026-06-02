import { invoke } from "@tauri-apps/api/core";
import type { Salesperson, CreateSalesperson, UpdateSalesperson } from "../types/salesperson";

export async function listSalespersons(): Promise<Salesperson[]> {
  return invoke("list_salespersons");
}

export async function getSalesperson(id: string): Promise<Salesperson> {
  return invoke("get_salesperson", { id });
}

export async function searchSalespersons(q: string): Promise<Salesperson[]> {
  return invoke("search_salespersons", { q });
}

export async function createSalesperson(cmd: CreateSalesperson): Promise<Salesperson> {
  return invoke("create_salesperson", { cmd });
}

export async function updateSalesperson(cmd: UpdateSalesperson): Promise<Salesperson> {
  return invoke("update_salesperson", { cmd });
}

export async function deleteSalesperson(id: string): Promise<void> {
  return invoke("delete_salesperson", { id });
}