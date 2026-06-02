export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitOfMeasure {
  name: string;
  symbol: string;
  active?: boolean;
}

export interface UpdateUnitOfMeasure {
  id: string;
  name?: string;
  symbol?: string;
  active?: boolean;
}