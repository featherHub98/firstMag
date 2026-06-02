export interface Salesperson {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesperson {
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  active?: boolean;
}

export interface UpdateSalesperson {
  id: string;
  code?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
}