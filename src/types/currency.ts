export interface Currency {
  id: string;
  code: string; // ISO 4217 code like USD, EUR, TND
  name: string;
  symbol: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCurrency {
  code: string;
  name: string;
  symbol: string;
  active?: boolean;
}

export interface UpdateCurrency {
  id: string;
  code?: string;
  name?: string;
  symbol?: string;
  active?: boolean;
}