import { invoke } from "@tauri-apps/api/core";
import type { DocumentSeries, UpdateDocumentSeries } from "../types/settings";

export async function getAppSettings(keys: string[]): Promise<Record<string, string>> {
  return invoke("get_app_settings", { keys });
}

export async function setAppSettings(entries: Record<string, string>): Promise<void> {
  return invoke("set_app_settings", { entries });
}

export async function listDocumentSeries(): Promise<DocumentSeries[]> {
  return invoke("list_document_series");
}

export async function updateDocumentSeries(cmd: UpdateDocumentSeries): Promise<void> {
  return invoke("update_document_series", { cmd });
}
