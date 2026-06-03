export interface DocumentSeries {
  id: string;
  doc_type: string;
  prefix: string;
  next_number: number;
  format: string;
}

export interface UpdateDocumentSeries {
  id: string;
  prefix: string;
  next_number: number;
  format: string;
}
