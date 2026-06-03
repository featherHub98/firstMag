import { invoke } from "@tauri-apps/api/core";
import type { CreateRayon, Rayon, UpdateRayon } from "../types/rayon";

export async function listRayons(): Promise<Rayon[]> {
  return invoke("list_rayons");
}

export async function getRayon(id: string): Promise<Rayon> {
  return invoke("get_rayon", { id });
}

export async function searchRayons(q: string): Promise<Rayon[]> {
  return invoke("search_rayons", { q });
}

export async function createRayon(cmd: CreateRayon): Promise<Rayon> {
  return invoke("create_rayon", { cmd });
}

export async function updateRayon(cmd: UpdateRayon): Promise<Rayon> {
  return invoke("update_rayon", { cmd });
}

export async function deleteRayon(id: string): Promise<void> {
  return invoke("delete_rayon", { id });
}
