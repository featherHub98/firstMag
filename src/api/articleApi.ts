import { invoke } from "@tauri-apps/api/core";
import type { Article, CreateArticle, UpdateArticle } from "../types";

export async function listArticles(): Promise<Article[]> {
  return invoke("list_articles");
}

export async function getArticle(id: string): Promise<Article> {
  return invoke("get_article", { id });
}

export async function searchArticles(q: string): Promise<Article[]> {
  return invoke("search_articles", { q });
}

export async function createArticle(cmd: CreateArticle): Promise<Article> {
  return invoke("create_article", { cmd });
}

export async function updateArticle(cmd: UpdateArticle): Promise<Article> {
  return invoke("update_article", { cmd });
}

export async function deleteArticle(id: string): Promise<void> {
  return invoke("delete_article", { id });
}
