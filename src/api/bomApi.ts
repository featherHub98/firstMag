import { invoke } from "@tauri-apps/api/core";
import type {
  ArticleBomHeader,
  ArticleBomLine,
  CreateArticleBomHeader,
  CreateArticleBomLine,
} from "../types";

export async function listArticleBomHeaders(parentArticleId?: string): Promise<ArticleBomHeader[]> {
  return invoke("list_article_bom_headers", { parentArticleId });
}

export async function createArticleBomHeader(cmd: CreateArticleBomHeader): Promise<ArticleBomHeader> {
  return invoke("create_article_bom_header", { cmd });
}

export async function setArticleBomHeaderActive(id: string, active: boolean): Promise<void> {
  return invoke("set_article_bom_header_active", { id, active });
}

export async function listArticleBomLines(bomId: string): Promise<ArticleBomLine[]> {
  return invoke("list_article_bom_lines", { bomId });
}

export async function createArticleBomLine(cmd: CreateArticleBomLine): Promise<ArticleBomLine> {
  return invoke("create_article_bom_line", { cmd });
}

export async function deleteArticleBomLine(id: string): Promise<void> {
  return invoke("delete_article_bom_line", { id });
}
