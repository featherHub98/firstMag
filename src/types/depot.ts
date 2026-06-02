export interface Depot {
  id: string;
  code: string;
  name: string;
  address: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDepot {
  code: string;
  name: string;
  address: string;
  active?: boolean;
}

export interface UpdateDepot {
  id: string;
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;
}