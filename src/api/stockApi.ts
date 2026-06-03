import { invoke } from "@tauri-apps/api/core";
import type {
  BarcodeImport,
  CreateBarcodeImport,
  CreateStockMovement,
  UpdateStockMovement,
  CreateStockVerification,
  StockLevel,
  StockMovement,
  StockReport,
  StockReportFilter,
  StockVerification,
} from "../types";

const stockVerificationsStore: StockVerification[] = [];
const barcodeImportsStore: BarcodeImport[] = [];

type RawStockMovement = Omit<StockMovement, "movement_type" | "source_depot_id" | "destination_depot_id"> & {
  movement_type: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMovement(movement: RawStockMovement): StockMovement {
  const movementType: StockMovement["movement_type"] =
    movement.movement_type === "entry" ||
    movement.movement_type === "exit" ||
    movement.movement_type === "transfer"
      ? movement.movement_type
      : "transfer";
  const sourceDepotId =
    movementType === "entry" ? null : movement.depot_id;
  const destinationDepotId =
    movementType === "exit"
      ? null
      : movementType === "transfer"
        ? movement.target_depot_id
        : movement.depot_id;
  return {
    ...movement,
    movement_type: movementType,
    source_depot_id: sourceDepotId,
    destination_depot_id: destinationDepotId,
  };
}

export function fmtDinars(millimes: number): string {
  return (millimes / 1000).toFixed(3);
}

export async function getStockLevel(articleId: string): Promise<StockLevel> {
  return invoke("get_stock_level", { article_id: articleId });
}

export async function listStockMovements(
  articleId?: string,
): Promise<StockMovement[]> {
  const rows = await invoke<RawStockMovement[]>("list_stock_movements", {
    article_id: articleId,
  });
  return rows.map(normalizeMovement);
}

export async function createStockMovement(
  cmd: CreateStockMovement,
): Promise<StockMovement> {
  const created = await invoke<RawStockMovement>("create_stock_movement", { cmd });
  return normalizeMovement(created);
}

export async function updateStockMovement(
  cmd: UpdateStockMovement,
): Promise<StockMovement> {
  const updated = await invoke<RawStockMovement>("update_stock_movement", { cmd });
  return normalizeMovement(updated);
}

export async function deleteStockMovement(id: string): Promise<void> {
  await invoke("delete_stock_movement", { id });
}

export async function listStockVerifications(): Promise<StockVerification[]> {
  return [...stockVerificationsStore].sort((a, b) =>
    b.verification_date.localeCompare(a.verification_date),
  );
}

export async function createStockVerification(
  cmd: CreateStockVerification,
): Promise<StockVerification> {
  const created: StockVerification = {
    id: makeId("stkv"),
    depot_id: cmd.depot_id,
    verification_date: cmd.verification_date,
    notes: cmd.notes,
    status: "pending",
    lines: cmd.lines.map((line) => ({
      ...line,
      difference:
        typeof line.theoretical_quantity === "number"
          ? line.quantity - line.theoretical_quantity
          : undefined,
      status:
        typeof line.theoretical_quantity === "number"
          ? line.quantity === line.theoretical_quantity
            ? "ok"
            : "difference"
          : "pending",
    })),
    created_at: nowIso(),
  };
  stockVerificationsStore.unshift(created);
  return created;
}

export async function confirmStockVerification(id: string): Promise<void> {
  const target = stockVerificationsStore.find((item) => item.id === id);
  if (!target) throw new Error("Vérification introuvable.");
  target.status = "confirmed";
}

export async function updateStockVerification(
  id: string,
  cmd: CreateStockVerification,
): Promise<StockVerification> {
  const index = stockVerificationsStore.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Vérification introuvable.");
  const current = stockVerificationsStore[index];
  const updated: StockVerification = {
    ...current,
    depot_id: cmd.depot_id,
    verification_date: cmd.verification_date,
    notes: cmd.notes,
    lines: cmd.lines.map((line) => ({
      ...line,
      difference:
        typeof line.theoretical_quantity === "number"
          ? line.quantity - line.theoretical_quantity
          : undefined,
      status:
        typeof line.theoretical_quantity === "number"
          ? line.quantity === line.theoretical_quantity
            ? "ok"
            : "difference"
          : "pending",
    })),
  };
  stockVerificationsStore[index] = updated;
  return updated;
}

export async function deleteStockVerification(id: string): Promise<void> {
  const index = stockVerificationsStore.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Vérification introuvable.");
  stockVerificationsStore.splice(index, 1);
}

export async function listBarcodeImports(): Promise<BarcodeImport[]> {
  return [...barcodeImportsStore].sort((a, b) =>
    b.import_date.localeCompare(a.import_date),
  );
}

export async function createBarcodeImport(
  cmd: CreateBarcodeImport,
): Promise<BarcodeImport> {
  const created: BarcodeImport = {
    id: makeId("bcimp"),
    depot_id: cmd.depot_id,
    import_date: cmd.import_date,
    reference: cmd.reference,
    notes: cmd.notes,
    status: "pending",
    lines: cmd.lines.map((line) => ({ ...line, status: "pending" })),
    created_at: nowIso(),
  };
  barcodeImportsStore.unshift(created);
  return created;
}

export async function confirmBarcodeImport(id: string): Promise<void> {
  const target = barcodeImportsStore.find((item) => item.id === id);
  if (!target) throw new Error("Importation introuvable.");
  target.status = "confirmed";
}

export async function updateBarcodeImport(
  id: string,
  cmd: CreateBarcodeImport,
): Promise<BarcodeImport> {
  const index = barcodeImportsStore.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Importation introuvable.");
  const current = barcodeImportsStore[index];
  const updated: BarcodeImport = {
    ...current,
    depot_id: cmd.depot_id,
    import_date: cmd.import_date,
    reference: cmd.reference,
    notes: cmd.notes,
    lines: cmd.lines.map((line) => ({ ...line })),
  };
  barcodeImportsStore[index] = updated;
  return updated;
}

export async function deleteBarcodeImport(id: string): Promise<void> {
  const index = barcodeImportsStore.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Importation introuvable.");
  barcodeImportsStore.splice(index, 1);
}

export async function listStockReports(
  filter: StockReportFilter = {},
): Promise<StockReport[]> {
  return invoke<StockReport[]>("list_stock_reports", { filter });
}
