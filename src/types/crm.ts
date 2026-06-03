export interface PartnerProfile {
  partner_id: string;
  fiscal_address: string;
  commercial_contact: string;
  payment_model: string;
  shipping_address: string;
  currency_code: string;
  credit_control_enabled: boolean;
  loyalty_barcode: string;
  family_segment: string;
  milestone_tier: string;
  deferred_discount_rate: number;
  global_discount_millimes: number;
  allow_deferred_payment: boolean;
  deposit_balance: number;
  last_visit_at: string | null;
  notes_ext: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertPartnerProfile {
  partner_id: string;
  fiscal_address: string;
  commercial_contact: string;
  payment_model: string;
  shipping_address: string;
  currency_code: string;
  credit_control_enabled: boolean;
  loyalty_barcode: string;
  family_segment: string;
  milestone_tier: string;
  deferred_discount_rate: number;
  global_discount_millimes: number;
  allow_deferred_payment: boolean;
  deposit_balance: number;
  last_visit_at: string | null;
  notes_ext: string;
}

export interface PartnerKpis {
  partner_id: string;
  yearly_total_ttc: number;
  monthly_total_ttc: number;
  yearly_invoice_count: number;
  last_invoice_at: string | null;
  last_purchase_at: string | null;
  outstanding_balance: number;
  pending_followups: number;
  open_reclamations: number;
}

export interface PartnerFollowUp {
  id: string;
  partner_id: string;
  subject: string;
  due_date: string | null;
  status: "pending" | "done" | "cancelled";
  priority: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerFollowUp {
  partner_id: string;
  subject: string;
  due_date: string | null;
  priority: number;
  notes: string;
}

export interface UpdatePartnerFollowUpStatus {
  id: string;
  status: "pending" | "done" | "cancelled";
}

export interface PartnerReclamation {
  id: string;
  partner_id: string | null;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  severity: "low" | "medium" | "high" | "critical";
  source: "client" | "supplier" | "internal";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreatePartnerReclamation {
  partner_id: string | null;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  source: "client" | "supplier" | "internal";
}

export interface UpdatePartnerReclamationStatus {
  id: string;
  status: "open" | "in_progress" | "resolved" | "closed";
}
