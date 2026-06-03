import { invoke } from "@tauri-apps/api/core";
import type {
  BackupResult,
  DbHealthResult,
  ExternalImportCsvCmd,
  ExternalImportCsvResult,
  RestoreResult,
  SyncRunResult,
  UploadPluCmd,
  UploadPluResult,
} from "../types";

export async function backupDatabase(targetPath: string): Promise<BackupResult> {
  return invoke("backup_database", { targetPath });
}

export async function restoreDatabaseFromBackup(sourcePath: string): Promise<RestoreResult> {
  return invoke("restore_database_from_backup", { sourcePath });
}

export async function verifyDatabaseHealth(): Promise<DbHealthResult> {
  return invoke("verify_database_health");
}

export async function uploadFiscalPlu(cmd: UploadPluCmd): Promise<UploadPluResult> {
  return invoke("upload_fiscal_plu", { cmd });
}

export async function importExternalRegisterCsv(cmd: ExternalImportCsvCmd): Promise<ExternalImportCsvResult> {
  return invoke("import_external_register_csv", { cmd });
}

export async function runSiteSyncNow(endpoint: string): Promise<SyncRunResult> {
  return invoke("run_site_sync_now", { endpoint });
}
