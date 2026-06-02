import { invoke } from "@tauri-apps/api/core";
import type { PaymentMethod, CreatePaymentMethod, UpdatePaymentMethod } from "../types/paymentMethod";

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  return invoke("list_payment_methods");
}

export async function getPaymentMethod(id: string): Promise<PaymentMethod> {
  return invoke("get_payment_method", { id });
}

export async function searchPaymentMethods(q: string): Promise<PaymentMethod[]> {
  return invoke("search_payment_methods", { q });
}

export async function createPaymentMethod(cmd: CreatePaymentMethod): Promise<PaymentMethod> {
  return invoke("create_payment_method", { cmd });
}

export async function updatePaymentMethod(cmd: UpdatePaymentMethod): Promise<PaymentMethod> {
  return invoke("update_payment_method", { cmd });
}

export async function deletePaymentMethod(id: string): Promise<void> {
  return invoke("delete_payment_method", { id });
}