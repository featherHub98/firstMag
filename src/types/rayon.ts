export interface Rayon {
  id: string;
  code: string;
  name: string;
  depot_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRayon {
  code: string;
  name: string;
  depot_id: string;
  active?: boolean;
}

export interface UpdateRayon {
  id: string;
  code?: string;
  name?: string;
  depot_id?: string;
  active?: boolean;
}
