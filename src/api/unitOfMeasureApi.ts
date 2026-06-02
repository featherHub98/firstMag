import { invoke } from "@tauri-apps/api/core";
import type { UnitOfMeasure, CreateUnitOfMeasure, UpdateUnitOfMeasure } from "../types/unitOfMeasure";

export async function listUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
  return invoke("list_units_of_measure");
}

export async function getUnitOfMeasure(id: string): Promise<UnitOfMeasure> {
  return invoke("get_unit_of_measure", { id });
}

export async function searchUnitsOfMeasure(q: string): Promise<UnitOfMeasure[]> {
  return invoke("search_units_of_measure", { q });
}

export async function createUnitOfMeasure(cmd: CreateUnitOfMeasure): Promise<UnitOfMeasure> {
  return invoke("create_unit_of_measure", { cmd });
}

export async function updateUnitOfMeasure(cmd: UpdateUnitOfMeasure): Promise<UnitOfMeasure> {
  return invoke("update_unit_of_measure", { cmd });
}

export async function deleteUnitOfMeasure(id: string): Promise<void> {
  return invoke("delete_unit_of_measure", { id });
}