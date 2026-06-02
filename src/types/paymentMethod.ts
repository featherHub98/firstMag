export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethod {
  code: string;
  name: string;
  description: string;
  active?: boolean;
}

export interface UpdatePaymentMethod {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
}