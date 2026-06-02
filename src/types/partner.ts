export type PartnerType = "client" | "supplier";

export interface Partner {
  id: string;
  partner_type: PartnerType;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  credit_limit: number;
  balance: number;
  notes: string;
  salesperson_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePartner {
  partner_type: PartnerType;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  credit_limit: number;
  notes: string;
  salesperson_id?: string | null;
}