import { invoke } from "@tauri-apps/api/core";

export async function fiscalConnect(port: string): Promise<string> {
  return invoke("fiscal_connect", { port });
}

export async function fiscalDisconnect(): Promise<void> {
  return invoke("fiscal_disconnect");
}

export async function fiscalCpx(operator: string, customer: string): Promise<string> {
  return invoke("fiscal_cpx", { operator, customer });
}

export async function fiscalCpm(amount: number, mode: string): Promise<string> {
  return invoke("fiscal_cpm", { amount, mode });
}

export async function fiscalCpb(): Promise<string> {
  return invoke("fiscal_cpb");
}

export async function fiscalRsx(reportType: number): Promise<string> {
  return invoke("fiscal_rsx", { reportType });
}

export async function fiscalRsz(reportType: number): Promise<string> {
  return invoke("fiscal_rsz", { reportType });
}

export async function fiscalRuz(): Promise<string> {
  return invoke("fiscal_ruz");
}

export async function fiscalReset(): Promise<string> {
  return invoke("fiscal_reset");
}
