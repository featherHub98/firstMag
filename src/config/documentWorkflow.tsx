import * as React from "react";
import {
  FileText,
  Truck,
  ClipboardList,
  RotateCcw,
  ScrollText,
} from "lucide-react";
import type { DocumentStatus, DocumentType } from "@/types";

export const documentTypeMeta: Record<
  DocumentType,
  { label: string; legacyLabel: string; icon: React.ReactNode; variant: "info" | "secondary" | "success" | "warning" }
> = {
  quote: { label: "Devis", legacyLabel: "DEVIS", icon: <ScrollText className="size-3" />, variant: "info" },
  order: { label: "Commande", legacyLabel: "BON DE COMMANDE", icon: <ClipboardList className="size-3" />, variant: "info" },
  delivery: { label: "Livraison", legacyLabel: "BON LIVRAISON", icon: <Truck className="size-3" />, variant: "secondary" },
  invoice: { label: "Facture", legacyLabel: "FACTURE", icon: <FileText className="size-3" />, variant: "success" },
  credit_note: { label: "Avoir", legacyLabel: "FACTURE_DE_RETOUR", icon: <RotateCcw className="size-3" />, variant: "warning" },
  purchase_order: { label: "Cmd. achat", legacyLabel: "BON COMM ACH", icon: <ClipboardList className="size-3" />, variant: "info" },
  purchase_delivery: { label: "BL achat", legacyLabel: "BON LIV ACH", icon: <Truck className="size-3" />, variant: "secondary" },
  purchase_invoice: { label: "Fact. achat", legacyLabel: "FACTURE ACHAT", icon: <FileText className="size-3" />, variant: "success" },
  purchase_return: { label: "Ret. achat", legacyLabel: "FACTURE RETOUR ACHAT", icon: <RotateCcw className="size-3" />, variant: "warning" },
};

export const statusMeta: Record<DocumentStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }> = {
  draft: { label: "Brouillon", variant: "warning" },
  confirmed: { label: "Confirmé", variant: "success" },
  transformed: { label: "Transformé", variant: "info" },
  cancelled: { label: "Annulé", variant: "destructive" },
  partial: { label: "Règlement partiel", variant: "warning" },
  paid: { label: "Soldé", variant: "success" },
};

const transformMatrix: Partial<Record<DocumentType, DocumentType>> = {
  quote: "order",
  order: "delivery",
  delivery: "invoice",
  purchase_order: "purchase_delivery",
  purchase_delivery: "purchase_invoice",
};

export function getTransformTarget(docType: DocumentType): DocumentType | null {
  return transformMatrix[docType] ?? null;
}

export function isPaymentRelevantDoc(docType: DocumentType): boolean {
  return docType === "invoice" || docType === "purchase_invoice";
}
