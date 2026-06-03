import { invoke } from "@tauri-apps/api/core";
import type {
  AccountingCategory,
  CreateAccountingCategory,
  UpdateAccountingCategory,
} from "../types/accountingCategory";

export async function listAccountingCategories(): Promise<AccountingCategory[]> {
  return invoke("list_accounting_categories");
}

export async function getAccountingCategory(id: string): Promise<AccountingCategory> {
  return invoke("get_accounting_category", { id });
}

export async function searchAccountingCategories(q: string): Promise<AccountingCategory[]> {
  return invoke("search_accounting_categories", { q });
}

export async function createAccountingCategory(
  cmd: CreateAccountingCategory,
): Promise<AccountingCategory> {
  return invoke("create_accounting_category", { cmd });
}

export async function updateAccountingCategory(
  cmd: UpdateAccountingCategory,
): Promise<AccountingCategory> {
  return invoke("update_accounting_category", { cmd });
}

export async function deleteAccountingCategory(id: string): Promise<void> {
  return invoke("delete_accounting_category", { id });
}
