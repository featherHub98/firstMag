import { invoke } from "@tauri-apps/api/core";
import type {
  CashMovement,
  CashSessionTotals,
  CashMovementSummary,
  CreateCashMovement,
  PosSession,
  PosTicket,
} from "../types";

export async function getOpenSession(): Promise<PosSession | null> {
  return invoke("get_open_session");
}

export async function openSession(
  cashierId: string,
  openingFund: number,
  registerId?: string,
): Promise<PosSession> {
  return invoke("open_session", { cashierId, openingFund, registerId });
}

export async function closeSession(sessionId: string, closingFund: number): Promise<PosSession> {
  return invoke("close_session", { sessionId, closingFund });
}

export async function newTicket(sessionId: string): Promise<PosTicket> {
  return invoke("new_ticket", { sessionId });
}

export async function listCashMovements(sessionId: string): Promise<CashMovement[]> {
  return invoke("list_cash_movements", { session_id: sessionId });
}

export async function addCashMovement(cmd: CreateCashMovement): Promise<CashMovement> {
  return invoke("add_cash_movement", { cmd });
}

export async function getSessionCashSummary(sessionId: string): Promise<CashMovementSummary> {
  return invoke("get_session_cash_summary", { session_id: sessionId });
}

export async function listSessionCashTotals(
  dateFrom?: string,
  dateTo?: string,
): Promise<CashSessionTotals[]> {
  return invoke("list_session_cash_totals", { date_from: dateFrom ?? null, date_to: dateTo ?? null });
}
