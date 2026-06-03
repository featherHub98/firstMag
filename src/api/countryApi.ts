import { invoke } from "@tauri-apps/api/core";
import type { Country, CreateCountry, UpdateCountry } from "../types/country";

export async function listCountries(): Promise<Country[]> {
  return invoke("list_countries");
}

export async function getCountry(id: string): Promise<Country> {
  return invoke("get_country", { id });
}

export async function searchCountries(q: string): Promise<Country[]> {
  return invoke("search_countries", { q });
}

export async function createCountry(cmd: CreateCountry): Promise<Country> {
  return invoke("create_country", { cmd });
}

export async function updateCountry(cmd: UpdateCountry): Promise<Country> {
  return invoke("update_country", { cmd });
}

export async function deleteCountry(id: string): Promise<void> {
  return invoke("delete_country", { id });
}
