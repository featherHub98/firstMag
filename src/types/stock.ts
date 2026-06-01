export interface StockLevel {
  article_id: string;
  depot_id: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  movement_type: string;
  article_id: string;
  depot_id: string;
  target_depot_id: string | null;
  quantity: number;
  reference: string;
  notes: string;
  created_at: string;
}
