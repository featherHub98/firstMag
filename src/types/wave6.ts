export interface BackupResult {
  path: string;
  bytes: number;
}

export interface RestoreResult {
  source_path: string;
  copied_tables: number;
}

export interface DbHealthResult {
  quick_check: string;
  integrity_check: string;
  ok: boolean;
}

export interface FiscalPluItem {
  article_code: string;
  label: string;
  price: number;
  barcode?: string | null;
}

export interface UploadPluCmd {
  source: string;
  items: FiscalPluItem[];
}

export interface UploadPluResult {
  accepted_count: number;
  source: string;
  uploaded_at: string;
}

export interface ExternalImportCsvCmd {
  path: string;
  strategy: "upsert" | "insert_only" | "update_only";
}

export interface ExternalImportCsvResult {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
}

export interface SyncRunResult {
  endpoint: string;
  started_at: string;
  status: string;
}
