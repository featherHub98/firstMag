export interface TariffCategory {
  id: string;
  code: string;
  name: string;
  discount_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTariffCategory {
  code: string;
  name: string;
  discount_rate: number;
  active?: boolean;
}

export interface UpdateTariffCategory {
  id: string;
  code?: string;
  name?: string;
  discount_rate?: number;
  active?: boolean;
}
