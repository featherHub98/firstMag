export interface ArticleBomHeader {
  id: string;
  parent_article_id: string;
  name: string;
  output_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleBomHeader {
  parent_article_id: string;
  name: string;
  output_quantity: number;
}

export interface ArticleBomLine {
  id: string;
  bom_id: string;
  component_article_id: string;
  quantity: number;
  created_at: string;
}

export interface CreateArticleBomLine {
  bom_id: string;
  component_article_id: string;
  quantity: number;
}
