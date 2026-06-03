export interface Gondola {
  id: string;
  code: string;
  name: string;
  depot_id: string;
  rayon_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGondola {
  code: string;
  name: string;
  depot_id: string;
  rayon_id: string;
  active?: boolean;
}

export interface UpdateGondola {
  id: string;
  code?: string;
  name?: string;
  depot_id?: string;
  rayon_id?: string;
  active?: boolean;
}
