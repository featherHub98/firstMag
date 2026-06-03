export interface PosSession {
  id: string;
  register_id: string;
  cashier_id: string;
  opening_fund: number;
  closing_fund: number | null;
  status: "open" | "closed";
  ticket_count: number;
  total_sales: number;
  opened_at: string;
  closed_at: string | null;
}

export interface PosTicket {
  id: string;
  session_id: string;
  ticket_number: number;
  status: "active" | "held" | "paid" | "cancelled";
  total_ht: number;
  total_tax: number;
  total_ttc: number;
  payment_status: "pending" | "partial" | "paid";
  created_at: string;
}

export interface TicketLine {
  id: string;
  ticket_id: string;
  article_id: string;
  article_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_ht: number;
  total_ttc: number;
}

export interface PaymentLine {
  id: string;
  ticket_id: string;
  payment_mode: string;
  amount: number;
}

export type CashMovementType = "in" | "out";

export interface CashMovement {
  id: string;
  session_id: string;
  movement_type: CashMovementType;
  amount: number;
  description: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface CreateCashMovement {
  session_id: string;
  movement_type: CashMovementType;
  amount: number;
  description: string;
  user_id: string;
  user_name: string;
}

export interface CashMovementSummary {
  opening_fund: number;
  total_in: number;
  total_out: number;
  current_cash: number;
}

export interface CashSessionTotals {
  session_id: string;
  register_id: string;
  cashier_id: string;
  status: "open" | "closed" | string;
  opening_fund: number;
  closing_fund: number | null;
  total_in: number;
  total_out: number;
  theoretical_closing: number;
  variance: number;
  opened_at: string;
  closed_at: string | null;
}
