export interface AppUser {
  id: string;
  code: string;
  name: string;
  role: string;
  active: boolean;
}

export interface AppRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface LoginResult {
  id: string;
  code: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface UpdateRolePermissions {
  role_id: string;
  permissions: string[];
}
