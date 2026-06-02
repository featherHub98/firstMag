export interface Bank {
  id: string;
  code: string;
  name: string;
  address: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBank {
  code: string;
  name: string;
  address: string;
  active?: boolean;
}

export interface UpdateBank {
  id: string;
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;
}