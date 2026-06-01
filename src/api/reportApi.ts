import { invoke } from "@tauri-apps/api/core";
import type { SaleReport } from "../types";

export async function getXReport(): Promise<SaleReport> {
  return invoke("get_x_report");
}

export async function getZReport(): Promise<SaleReport> {
  return invoke("get_z_report");
}

export async function printReport(title: string): Promise<void> {
  return invoke("print_report", { title });
}
