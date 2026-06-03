import { invoke } from "@tauri-apps/api/core";
import type { CreateProductRange, ProductRange, UpdateProductRange } from "../types/productRange";

export async function listProductRanges(): Promise<ProductRange[]> {
  return invoke("list_product_ranges");
}

export async function getProductRange(id: string): Promise<ProductRange> {
  return invoke("get_product_range", { id });
}

export async function searchProductRanges(q: string): Promise<ProductRange[]> {
  return invoke("search_product_ranges", { q });
}

export async function createProductRange(cmd: CreateProductRange): Promise<ProductRange> {
  return invoke("create_product_range", { cmd });
}

export async function updateProductRange(cmd: UpdateProductRange): Promise<ProductRange> {
  return invoke("update_product_range", { cmd });
}

export async function deleteProductRange(id: string): Promise<void> {
  return invoke("delete_product_range", { id });
}
