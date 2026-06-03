export interface StockLevel {
  article_id: string;
  depot_id: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  movement_type: "entry" | "exit" | "transfer";
  article_id: string;
  depot_id: string;
  target_depot_id: string | null;
  source_depot_id: string | null;
  destination_depot_id: string | null;
  quantity: number;
  reference: string;
  notes: string;
  created_at: string;
}

export interface CreateStockMovement {
  article_id: string;
  source_depot_id: string | null;
  destination_depot_id: string | null;
  quantity: number;
  movement_type: "entry" | "exit" | "transfer";
  reference: string;
  notes: string;
}

export interface UpdateStockMovement extends CreateStockMovement {
  id: string;
}

export interface StockVerificationLine {
  article_id: string;
  article_name: string;
  quantity: number;
  theoretical_quantity?: number;
  difference?: number;
  status?: "pending" | "ok" | "difference";
}

export interface StockVerification {
  id: string;
  depot_id: string;
  verification_date: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
  lines: StockVerificationLine[];
  created_at: string;
}

export interface CreateStockVerification {
  depot_id: string;
  verification_date: string;
  notes: string;
  lines: StockVerificationLine[];
}

export interface BarcodeImportLine {
  article_id: string;
  article_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  status?: "pending" | "confirmed";
}

export interface BarcodeImport {
  id: string;
  depot_id: string;
  import_date: string;
  reference: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
  lines: BarcodeImportLine[];
  created_at: string;
}

export interface CreateBarcodeImport {
  depot_id: string;
  import_date: string;
  reference: string;
  notes: string;
  lines: BarcodeImportLine[];
}

export interface StockReport {
  date: string;
  depot_id: string;
  article_id: string;
  initial_quantity: number;
  entries_quantity: number;
  exits_quantity: number;
  final_quantity: number;
  variance: number;
}

export interface StockReportFilter {
  depot_id?: string | null;
  article_id?: string | null;
  date_from?: string;
  date_to?: string;
}
