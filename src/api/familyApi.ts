import { invoke } from "@tauri-apps/api/core";
import type { ArticleFamily, CreateArticleFamily, UpdateArticleFamily } from "../types/family";

export async function listArticleFamilies(): Promise<ArticleFamily[]> {
  return invoke("list_article_families");
}

export async function getArticleFamily(id: string): Promise<ArticleFamily> {
  return invoke("get_article_family", { id });
}

export async function searchArticleFamilies(q: string): Promise<ArticleFamily[]> {
  return invoke("search_article_families", { q });
}

export async function createArticleFamily(cmd: CreateArticleFamily): Promise<ArticleFamily> {
  return invoke("create_article_family", { cmd });
}

export async function updateArticleFamily(cmd: UpdateArticleFamily): Promise<ArticleFamily> {
  return invoke("update_article_family", { cmd });
}

export async function deleteArticleFamily(id: string): Promise<void> {
  return invoke("delete_article_family", { id });
}