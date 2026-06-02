import { invoke } from "@tauri-apps/api/core";
import type { Bank, CreateBank, UpdateBank } from "../types/bank";

export async function listBanks(): Promise<Bank[]> {
  return invoke("list_banks");
}

export async function getBank(id: string): Promise<Bank> {
  return invoke("get_bank", { id });
}

export async function searchBanks(q: string): Promise<Bank[]> {
  return invoke("search_banks", { q });
}

export async function createBank(cmd: CreateBank): Promise<Bank> {
  return invoke("create_bank", { cmd });
}

export async function updateBank(cmd: UpdateBank): Promise<Bank> {
  return invoke("update_bank", { cmd });
}

export async function deleteBank(id: string): Promise<void> {
  return invoke("delete_bank", { id });
}