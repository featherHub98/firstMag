export interface Cashier {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCashier {
  code: string;
  name: string;
  email: string;
  phone: string;
  active?: boolean;
}

export interface UpdateCashier {
  id: string;
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
}
