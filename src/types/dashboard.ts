export interface DashboardStats {
  total_articles: number;
  priced_articles: number;
  total_clients: number;
  total_documents: number;
  stock_value_pa: number;
  stock_value_pv: number;
  recent_documents: DocSummary[];
}

export interface DocSummary {
  id: string;
  doc_number: string;
  doc_type: string;
  partner_name: string;
  total_ttc: number;
  created_at: string;
}
