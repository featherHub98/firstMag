export interface ArticleFamily {
  id: string;
  name: string;
  parent_id: string | null;
  level: number; // 0 for root families, 1 for sub-families, etc.
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleFamily {
  name: string;
  parent_id?: string | null;
}

export interface UpdateArticleFamily {
  id: string;
  name?: string;
  parent_id?: string | null;
  active?: boolean;
}

// Helper type for tree structures
export interface ArticleFamilyTree extends ArticleFamily {
  children?: ArticleFamilyTree[];
}