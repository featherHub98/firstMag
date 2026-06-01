export interface SaleReport {
  period_start: string;
  period_end: string;
  total_transactions: number;
  total_quantity: number;
  total_ht: number;
  total_tax: number;
  total_ttc: number;
  cash_total: number;
  card_total: number;
  cheque_total: number;
  transfer_total: number;
  session_id: string | null;
}
