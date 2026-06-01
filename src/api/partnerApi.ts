import { invoke } from "@tauri-apps/api/core";
import type { Partner, CreatePartner } from "../types";

export async function listPartners(partnerType?: string): Promise<Partner[]> {
  return invoke("list_partners", { partnerType });
}

export async function getPartner(id: string): Promise<Partner> {
  return invoke("get_partner", { id });
}

export async function createPartner(cmd: CreatePartner): Promise<Partner> {
  return invoke("create_partner", { cmd });
}

export async function searchPartners(q: string): Promise<Partner[]> {
  return invoke("search_partners", { q });
}
