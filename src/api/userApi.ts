import { invoke } from "@tauri-apps/api/core";
import type { AppRole, AppUser, LoginResult, UpdateRolePermissions } from "../types/user";

export async function listUsers(): Promise<AppUser[]> {
  return invoke("list_users");
}

export async function listRoles(): Promise<AppRole[]> {
  return invoke("list_roles");
}

export async function loginUser(pin: string): Promise<LoginResult> {
  return invoke("login_user", { pin });
}

export async function updateRolePermissions(cmd: UpdateRolePermissions): Promise<void> {
  return invoke("update_role_permissions", { cmd });
}
