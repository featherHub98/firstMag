import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Printer,
  CheckCircle,
  ArrowRight,
  FileText,
  WalletCards,
} from "lucide-react";
import {
  listDocuments,
  getDocumentLines,
  transformDocument,
  confirmDocument,
  setDocumentStatus,
  printInvoice,
  fmtDinars,
} from "../api";
import { useToastStore } from "../api/toastStore";
import { useUiStore } from "../stores/uiStore";
import type { Document, DocumentLine, DocumentType, DocumentStatus } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  documentTypeMeta,
  getTransformTarget,
  isPaymentRelevantDoc,
  statusMeta,
} from "@/config/documentWorkflow";

const purchaseTabs: { key: DocumentType | ""; label: string }[] = [
  { key: "", label: "Tous" },
  { key: "purchase_order", label: "Cmd. achat" },
  { key: "purchase_delivery", label: "BL achat" },
  { key: "purchase_invoice", label: "Fact. achat" },
  { key: "purchase_return", label: "Ret. achat" },
];

const allowedPurchaseTypes: DocumentType[] = [
  "purchase_order",
  "purchase_delivery",
  "purchase_invoice",
  "purchase_return",
];

export default function PurchasePage() {
  const [docs, setDocs] = React.useState<Document[]>([]);
  const [filter, setFilter] = React.useState<DocumentType | "">("");
  const [selected, setSelected] = React.useState<Document | null>(null);
  const [lines, setLines] = React.useState<DocumentLine[]>([]);
  const [loading, setLoading] = React.useState(true);
  const addToast = useToastStore((s) => s.addToast);
  const showLegacyLabels = useUiStore((s) => s.legacyLabels);

  React.useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const data = await listDocuments(filter || undefined);
      setDocs(data.filter((doc) => allowedPurchaseTypes.includes(doc.doc_type)));
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function openDoc(d: Document) {
    setSelected(d);
    try {
      const l = await getDocumentLines(d.id);
      setLines(l);
    } catch {
      setLines([]);
    }
  }

  async function handleTransform() {
    if (!selected) return;
    const target = getTransformTarget(selected.doc_type);
    if (!target) {
      addToast("Ce document ne peut pas être transformé.", "warning");
      return;
    }
    try {
      const newDoc = await transformDocument(selected.id, target);
      addToast(`Transformé en ${documentTypeMeta[target].label}: ${newDoc.doc_number}`, "success");
      setSelected(null);
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleConfirm() {
    if (!selected) return;
    try {
      await confirmDocument(selected.id);
      addToast("Document confirmé", "success");
      setSelected(null);
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handlePaymentVerification(status: Extract<DocumentStatus, "partial" | "paid">) {
    if (!selected) return;
    try {
      await setDocumentStatus(selected.id, status);
      addToast(status === "paid" ? "Règlement fournisseur soldé" : "Règlement fournisseur partiel", "success");
      setSelected({ ...selected, status });
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "doc_number",
      header: "N°",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.doc_number}</span>,
    },
    {
      accessorKey: "doc_type",
      header: "Type",
      cell: ({ row }) => {
        const t = documentTypeMeta[row.original.doc_type];
        return (
          <Badge variant={t.variant} className="gap-1">
            {t.icon}
            {showLegacyLabels ? `${t.label} (${t.legacyLabel})` : t.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "partner_name",
      header: "Fournisseur",
      cell: ({ row }) => row.original.partner_name || <span className="text-muted-foreground/40">—</span>,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const meta = statusMeta[row.original.status as DocumentStatus];
        return (
          <Badge variant={meta?.variant || "secondary"}>
            {meta?.label || row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_ttc",
      header: "Total TTC",
      cell: ({ row }) => <span className="font-semibold tabular-nums">{fmtDinars(row.original.total_ttc)} D</span>,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.created_at).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
  ];

  const transformTarget = selected ? getTransformTarget(selected.doc_type) : null;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Documents d'achat"
        description="Commandes, livraisons, factures et retours d'achat"
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as DocumentType | "")} className="mb-4">
        <TabsList>
          {purchaseTabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={docs}
        isLoading={loading}
        onRowClick={openDoc}
        searchColumn="search"
        searchPlaceholder="Rechercher par n° ou fournisseur..."
        emptyState={
          <EmptyState
            icon={<FileText className="size-6" />}
            title="Aucun document d'achat"
            description="Les documents d'achat apparaîtront ici."
          />
        }
      />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
          {selected && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="font-mono">{selected.doc_number}</SheetTitle>
                <SheetDescription>
                  {showLegacyLabels
                    ? `${documentTypeMeta[selected.doc_type].label} - ${documentTypeMeta[selected.doc_type].legacyLabel}`
                    : documentTypeMeta[selected.doc_type].label}
                </SheetDescription>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={statusMeta[selected.status as DocumentStatus]?.variant || "secondary"}>
                    {statusMeta[selected.status as DocumentStatus]?.label || selected.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fournisseur</p>
                  <p className="font-medium">{selected.partner_name || "—"}</p>
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm">{selected.notes}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Lignes</p>
                  <div className="space-y-2">
                    {lines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune ligne</p>
                    ) : (
                      lines.map((l) => (
                        <div key={l.id} className="flex items-center gap-2 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{l.article_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {fmtDinars(l.unit_price)} × {l.quantity}
                            </p>
                          </div>
                          <span className="font-semibold tabular-nums">{fmtDinars(l.total_ttc)} D</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total HT</span>
                    <span className="tabular-nums">{fmtDinars(selected.total_ht)} D</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>TVA</span>
                    <span className="tabular-nums">{fmtDinars(selected.total_ttc - selected.total_ht)} D</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-1">
                    <span>Total TTC</span>
                    <span className="tabular-nums">{fmtDinars(selected.total_ttc)} D</span>
                  </div>
                </div>
              </div>

              <div className="border-t p-4 flex flex-wrap gap-2">
                {selected.status === "draft" && (
                  <Button onClick={handleConfirm} className="flex-1">
                    <CheckCircle className="size-4" />
                    Confirmer
                  </Button>
                )}
                {transformTarget && selected.status !== "cancelled" && selected.status !== "paid" && (
                  <Button onClick={handleTransform} variant="outline" className="flex-1">
                    <ArrowRight className="size-4" />
                    Transformer en {documentTypeMeta[transformTarget].label}
                  </Button>
                )}
                {isPaymentRelevantDoc(selected.doc_type) && selected.status !== "paid" && (
                  <>
                    <Button
                      onClick={() => handlePaymentVerification("partial")}
                      variant="outline"
                      className="flex-1"
                    >
                      <WalletCards className="size-4" />
                      Règlement partiel
                    </Button>
                    <Button
                      onClick={() => handlePaymentVerification("paid")}
                      variant="success"
                      className="flex-1"
                    >
                      <CheckCircle className="size-4" />
                      Soldé
                    </Button>
                  </>
                )}
                <Button onClick={() => printInvoice(selected.id)} variant="outline" className="flex-1">
                  <Printer className="size-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
