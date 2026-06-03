import { invoke } from "@tauri-apps/api/core";
import type { CreateGondola, Gondola, UpdateGondola } from "../types/gondola";

export async function listGondolas(): Promise<Gondola[]> {
  return invoke("list_gondolas");
}

export async function getGondola(id: string): Promise<Gondola> {
  return invoke("get_gondola", { id });
}

export async function searchGondolas(q: string): Promise<Gondola[]> {
  return invoke("search_gondolas", { q });
}

export async function createGondola(cmd: CreateGondola): Promise<Gondola> {
  return invoke("create_gondola", { cmd });
}

export async function updateGondola(cmd: UpdateGondola): Promise<Gondola> {
  return invoke("update_gondola", { cmd });
}

export async function deleteGondola(id: string): Promise<void> {
  return invoke("delete_gondola", { id });
}
