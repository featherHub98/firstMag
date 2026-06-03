import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Barcode, CheckCircle } from "lucide-react";
import {
  listBarcodeImports,
  createBarcodeImport,
  updateBarcodeImport,
  deleteBarcodeImport,
  confirmBarcodeImport,
  fmtDinars,
} from "../api/stockApi";
import { listArticles } from "../api/articleApi";
import { listDepots } from "../api/depotApi";
import { useToastStore } from "../api/toastStore";
import type { BarcodeImport, CreateBarcodeImport, Article, Depot } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE_OPTION = "__none__";

export default function BarcodeStockImportPage() {
  const [items, setItems] = React.useState<BarcodeImport[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<BarcodeImport | null>(null);
  const [confirmId, setConfirmId] = React.useState<BarcodeImport | null>(null);
  const [scannedBarcode, setScannedBarcode] = React.useState("");
  const [form, setForm] = React.useState<CreateBarcodeImport>({
    depot_id: "",
    import_date: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
    lines: [],
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
    void loadArticles();
    void loadDepots();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setItems(await listBarcodeImports());
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadArticles() {
    try {
      setArticles(await listArticles());
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadDepots() {
    try {
      setDepots(await listDepots());
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  function openNew() {
    setEditId(null);
    setScannedBarcode("");
    setForm({
      depot_id: "",
      import_date: new Date().toISOString().slice(0, 10),
      reference: "",
      notes: "",
      lines: [],
    });
    setShowForm(true);
  }

  function openEdit(item: BarcodeImport) {
    setEditId(item.id);
    setScannedBarcode("");
    setForm({
      depot_id: item.depot_id,
      import_date: item.import_date,
      reference: item.reference,
      notes: item.notes,
      lines: item.lines ?? [],
    });
    setShowForm(true);
  }

  function handleBarcodeScan(barcode: string) {
    const article = articles.find((a) => a.barcode === barcode);
    if (!article) {
      addToast(`No article found for barcode: ${barcode}`, "error");
      setScannedBarcode("");
      return;
    }

    const index = form.lines.findIndex((line) => line.article_id === article.id);
    if (index >= 0) {
      const updated = [...form.lines];
      updated[index] = { ...updated[index], quantity: updated[index].quantity + 1 };
      setForm({ ...form, lines: updated });
    } else {
      setForm({
        ...form,
        lines: [
          ...form.lines,
          {
            article_id: article.id,
            article_name: article.name,
            quantity: 1,
            barcode: article.barcode,
            unit_price: article.sale_price,
            status: "pending",
          },
        ],
      });
    }

    setScannedBarcode("");
  }

  function removeLine(index: number) {
    const updated = [...form.lines];
    updated.splice(index, 1);
    setForm({ ...form, lines: updated });
  }

  function updateLineQuantity(index: number, quantity: number) {
    const updated = [...form.lines];
    updated[index] = { ...updated[index], quantity };
    setForm({ ...form, lines: updated });
  }

  async function save() {
    if (!form.depot_id || form.lines.length === 0) {
      addToast("Depot and at least one line are required", "error");
      return;
    }
    try {
      if (editId) {
        await updateBarcodeImport(editId, form);
        addToast("Barcode import updated", "success");
      } else {
        await createBarcodeImport(form);
        addToast("Barcode import created", "success");
      }
      setShowForm(false);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteBarcodeImport(deleteId.id);
      addToast("Barcode import deleted", "success");
      setDeleteId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleConfirm() {
    if (!confirmId) return;
    try {
      await confirmBarcodeImport(confirmId.id);
      addToast("Barcode import confirmed", "success");
      setConfirmId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<BarcodeImport>[] = [
    {
      accessorKey: "import_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.import_date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      accessorKey: "depot_id",
      header: "Depot",
      cell: ({ row }) => {
        const depot = depots.find((d) => d.id === row.original.depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.depot_id}</span>;
      },
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => <span className="text-muted-foreground/80">{row.original.reference}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const meta: Record<string, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }> = {
          pending: { label: "Pending", variant: "warning" },
          confirmed: { label: "Confirmed", variant: "success" },
          cancelled: { label: "Cancelled", variant: "destructive" },
        };
        const statusInfo = meta[status] ?? { label: status, variant: "secondary" };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {row.original.status !== "confirmed" && (
            <>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(row.original); }}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </>
          )}
          {row.original.status === "pending" && (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setConfirmId(row.original); }}>
              <CheckCircle className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Barcode Stock Import"
        description="Import stock by scanning article barcodes"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New import
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 max-w-sm" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchColumn="search"
          searchPlaceholder="Search by date, depot, or reference..."
          emptyState={
            <EmptyState
              icon={<Barcode className="size-6" />}
              title="No barcode import"
              description="Create your first barcode import."
              action={<Button onClick={openNew}><Plus className="size-4" /> New import</Button>}
            />
          }
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Edit barcode import" : "New barcode import"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="depot_id">Depot *</Label>
              <Select
                value={form.depot_id || NONE_OPTION}
                onValueChange={(v) => setForm({ ...form, depot_id: v === NONE_OPTION ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select depot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Select depot</SelectItem>
                  {depots.map((depot) => (
                    <SelectItem key={depot.id} value={depot.id}>{depot.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="import_date">Import date *</Label>
              <Input
                id="import_date"
                type="date"
                value={form.import_date}
                onChange={(e) => setForm({ ...form, import_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode_scan">Scan barcode</Label>
            <div className="relative">
              <Input
                id="barcode_scan"
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && scannedBarcode.trim()) {
                    e.preventDefault();
                    handleBarcodeScan(scannedBarcode.trim());
                  }
                }}
                placeholder="Scan or type barcode then press Enter"
                className="pl-10"
              />
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            </div>
          </div>

          {form.lines.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Import lines</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Article</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {form.lines.map((line, index) => (
                      <tr key={line.article_id} className="bg-white">
                        <td className="px-4 py-2 text-sm font-medium">{line.article_name}</td>
                        <td className="px-4 py-2 text-sm">{line.barcode || "-"}</td>
                        <td className="px-4 py-2 text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={line.quantity}
                            onChange={(e) => updateLineQuantity(index, Number(e.target.value) || 0)}
                            className="w-24 text-center"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">{fmtDinars(line.unit_price || 0)}</td>
                        <td className="px-4 py-2 text-sm font-semibold">{fmtDinars((line.unit_price || 0) * line.quantity)}</td>
                        <td className="px-4 py-2 text-right text-sm">
                          <Button variant="ghost" size="icon" onClick={() => removeLine(index)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: !!deleteId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Delete import</h3>
        <p className="mb-4">This action is irreversible.</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => void del()}>Delete</Button>
        </div>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: !!confirmId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Confirm import</h3>
        <p className="mb-4">Confirmation applies stock updates and closes this import.</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button variant="success" onClick={() => void handleConfirm()}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
