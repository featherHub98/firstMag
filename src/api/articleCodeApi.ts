import { invoke } from "@tauri-apps/api/core";
import type { ArticleCode, CreateArticleCode } from "../types";

export async function listArticleCodes(articleId?: string): Promise<ArticleCode[]> {
  return invoke("list_article_codes", { articleId });
}

export async function searchArticleCodes(q: string): Promise<ArticleCode[]> {
  return invoke("search_article_codes", { q });
}

export async function createArticleCode(cmd: CreateArticleCode): Promise<ArticleCode> {
  return invoke("create_article_code", { cmd });
}

export async function deleteArticleCode(id: string): Promise<void> {
  return invoke("delete_article_code", { id });
}
