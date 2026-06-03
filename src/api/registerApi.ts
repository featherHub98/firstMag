import { invoke } from "@tauri-apps/api/core";
import type { CreateRegister, Register, UpdateRegister } from "../types/register";

export async function listRegisters(): Promise<Register[]> {
  return invoke("list_registers");
}

export async function getRegister(id: string): Promise<Register> {
  return invoke("get_register", { id });
}

export async function searchRegisters(q: string): Promise<Register[]> {
  return invoke("search_registers", { q });
}

export async function createRegister(cmd: CreateRegister): Promise<Register> {
  return invoke("create_register", { cmd });
}

export async function updateRegister(cmd: UpdateRegister): Promise<Register> {
  return invoke("update_register", { cmd });
}

export async function deleteRegister(id: string): Promise<void> {
  return invoke("delete_register", { id });
}
