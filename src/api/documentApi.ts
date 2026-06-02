import { invoke } from "@tauri-apps/api/core";
import type { Document, DocumentLine, CreateDocument } from "../types";

export async function listDocuments(docType?: string): Promise<Document[]> {
  return invoke("list_documents", { docType });
}

export async function getDocument(id: string): Promise<Document> {
  return invoke("get_document", { id });
}

export async function getDocumentLines(id: string): Promise<DocumentLine[]> {
  return invoke("get_document_lines", { id });
}

export async function createDocument(cmd: CreateDocument): Promise<[Document, DocumentLine[]]> {
  return invoke("create_document", { cmd });
}

export async function transformDocument(id: string): Promise<Document> {
  return invoke("transform_document", { id });
}

export async function confirmDocument(id: string): Promise<void> {
  return invoke("confirm_document", { id });
}

export async function printInvoice(docId: string): Promise<void> {
  return invoke("print_invoice", { docId });
}

export async function printReceipt(docId: string): Promise<void> {
  return invoke("print_receipt", { docId });
}

export async function printCheque(docId: string): Promise<void> {
  return invoke("print_cheque", { docId });
}
