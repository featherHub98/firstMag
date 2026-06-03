export interface ProductRange {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRange {
  code: string;
  name: string;
  description: string;
  active?: boolean;
}

export interface UpdateProductRange {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
}
