export type DocumentType =
  | "quote" | "order" | "delivery" | "invoice" | "credit_note"
  | "purchase_order" | "purchase_delivery" | "purchase_invoice" | "purchase_return";

export type DocumentStatus =
  | "draft"
  | "confirmed"
  | "transformed"
  | "cancelled"
  | "partial"
  | "paid";

export interface Document {
  id: string;
  doc_type: DocumentType;
  doc_number: string;
  status: DocumentStatus;
  partner_id: string;
  partner_name: string;
  total_ht: number;
  total_tax: number;
  total_ttc: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentLine {
  id: string;
  document_id: string;
  article_id: string;
  article_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_ht: number;
  total_ttc: number;
}

export interface CreateDocument {
  doc_type: DocumentType;
  partner_id: string;
  partner_name: string;
  notes: string;
  lines: CreateDocumentLine[];
}

export interface CreateDocumentLine {
  article_id: string;
  article_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}
