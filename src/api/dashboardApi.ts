import { invoke } from "@tauri-apps/api/core";
import type { DashboardStats } from "../types";

export async function getDashboardStats(): Promise<DashboardStats> {
  return invoke("get_dashboard_stats");
}
