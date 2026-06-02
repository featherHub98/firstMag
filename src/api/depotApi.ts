import { invoke } from "@tauri-apps/api/core";
import type { Depot, CreateDepot, UpdateDepot } from "../types/depot";

export async function listDepots(): Promise<Depot[]> {
  return invoke("list_depots");
}

export async function getDepot(id: string): Promise<Depot> {
  return invoke("get_depot", { id });
}

export async function searchDepots(q: string): Promise<Depot[]> {
  return invoke("search_depots", { q });
}

export async function createDepot(cmd: CreateDepot): Promise<Depot> {
  return invoke("create_depot", { cmd });
}

export async function updateDepot(cmd: UpdateDepot): Promise<Depot> {
  return invoke("update_depot", { cmd });
}

export async function deleteDepot(id: string): Promise<void> {
  return invoke("delete_depot", { id });
}