export interface Article {
  id: string;
  code: string;
  barcode: string;
  name: string;
  family_id: string | null;
  sub_family_id: string | null;
  purchase_price: number;
  sale_price: number;
  tax_rate_id: string | null;
  unit_of_measure_id: string | null;
  image_path: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleFamily {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface ArticleSubFamily {
  id: string;
  name: string;
  family_id: string;
}

export interface CreateArticle {
  code: string;
  barcode: string;
  name: string;
  family_id?: string | null;
  sub_family_id?: string | null;
  purchase_price: number;
  sale_price: number;
  tax_rate_id?: string | null;
  unit_of_measure_id?: string | null;
}

export interface UpdateArticle {
  id: string;
  code?: string;
  barcode?: string;
  name?: string;
  family_id?: string | null;
  sub_family_id?: string | null;
  purchase_price?: number;
  sale_price?: number;
  tax_rate_id?: string | null;
  unit_of_measure_id?: string | null;
  active?: boolean;
}

export interface ArticleCode {
  id: string;
  article_id: string;
  code: string;
  code_type: "barcode" | "plu";
  active: boolean;
  created_at: string;
}

export interface CreateArticleCode {
  article_id: string;
  code: string;
  code_type: "barcode" | "plu";
}
