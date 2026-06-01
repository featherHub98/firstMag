import { invoke } from "@tauri-apps/api/core";
import type { PosSession, PosTicket } from "../types";

export async function getOpenSession(): Promise<PosSession | null> {
  return invoke("get_open_session");
}

export async function openSession(cashierId: string, openingFund: number): Promise<PosSession> {
  return invoke("open_session", { cashierId, openingFund });
}

export async function closeSession(sessionId: string, closingFund: number): Promise<PosSession> {
  return invoke("close_session", { sessionId, closingFund });
}

export async function newTicket(sessionId: string): Promise<PosTicket> {
  return invoke("new_ticket", { sessionId });
}
