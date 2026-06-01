import { invoke } from "@tauri-apps/api/core";
import type { StockLevel, StockMovement } from "../types";

export async function getStockLevel(articleId: string): Promise<StockLevel> {
  return invoke("get_stock_level", { articleId });
}

export async function listStockMovements(articleId?: string): Promise<StockMovement[]> {
  return invoke("list_stock_movements", { articleId });
}
