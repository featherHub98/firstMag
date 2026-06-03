export interface AdvancedTaxRate {
  id: string;
  code: string;
  name: string;
  rate: number;
  surcharge_rate: number;
  withholding_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdvancedTaxRate {
  code: string;
  name: string;
  rate: number;
  surcharge_rate: number;
  withholding_rate: number;
  active?: boolean;
}

export interface UpdateAdvancedTaxRate {
  id: string;
  code?: string;
  name?: string;
  rate?: number;
  surcharge_rate?: number;
  withholding_rate?: number;
  active?: boolean;
}
