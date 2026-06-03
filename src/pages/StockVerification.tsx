import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, CheckCircle, Zap } from "lucide-react";
import {
  listStockVerifications,
  createStockVerification,
  updateStockVerification,
  deleteStockVerification,
  confirmStockVerification,
} from "../api/stockApi";
import { listArticles } from "../api/articleApi";
import { listDepots } from "../api/depotApi";
import { useToastStore } from "../api/toastStore";
import type { StockVerification, CreateStockVerification, Article, Depot } from "../types";
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

export default function StockVerificationPage() {
  const [items, setItems] = React.useState<StockVerification[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<StockVerification | null>(null);
  const [confirmId, setConfirmId] = React.useState<StockVerification | null>(null);
  const [searchArticle, setSearchArticle] = React.useState("");
  const [form, setForm] = React.useState<CreateStockVerification>({
    depot_id: "",
    verification_date: new Date().toISOString().slice(0, 10),
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
      setItems(await listStockVerifications());
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
    setSearchArticle("");
    setForm({
      depot_id: "",
      verification_date: new Date().toISOString().slice(0, 10),
      notes: "",
      lines: [],
    });
    setShowForm(true);
  }

  function openEdit(item: StockVerification) {
    setEditId(item.id);
    setSearchArticle("");
    setForm({
      depot_id: item.depot_id,
      verification_date: item.verification_date,
      notes: item.notes,
      lines: item.lines ?? [],
    });
    setShowForm(true);
  }

  function addLineForArticle(article: Article) {
    const index = form.lines.findIndex((line) => line.article_id === article.id);
    if (index >= 0) {
      const updated = [...form.lines];
      updated[index] = { ...updated[index], quantity: updated[index].quantity + 1 };
      setForm({ ...form, lines: updated });
      return;
    }
    setForm({
      ...form,
      lines: [
        ...form.lines,
        {
          article_id: article.id,
          article_name: article.name,
          quantity: 1,
          theoretical_quantity: 0,
          difference: 0,
          status: "pending",
        },
      ],
    });
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
        await updateStockVerification(editId, form);
        addToast("Stock verification updated", "success");
      } else {
        await createStockVerification(form);
        addToast("Stock verification created", "success");
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
      await deleteStockVerification(deleteId.id);
      addToast("Stock verification deleted", "success");
      setDeleteId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleConfirm() {
    if (!confirmId) return;
    try {
      await confirmStockVerification(confirmId.id);
      addToast("Stock verification confirmed", "success");
      setConfirmId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  React.useEffect(() => {
    if (searchArticle.length < 2) return;
    const term = searchArticle.toLowerCase();
    const matches = articles.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.code.toLowerCase().includes(term) ||
        a.barcode.toLowerCase().includes(term),
    );
    if (matches.length === 1) {
      addLineForArticle(matches[0]);
      setSearchArticle("");
    }
  }, [searchArticle]);

  const columns: ColumnDef<StockVerification>[] = [
    {
      accessorKey: "verification_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.verification_date).toLocaleDateString("fr-FR")}
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
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => <span className="text-muted-foreground/80">{row.original.notes}</span>,
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
        title="Stock Verification"
        description="Run physical inventory checks for real stock reconciliation"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New verification
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
          searchPlaceholder="Search by date, depot, or notes..."
          emptyState={
            <EmptyState
              icon={<Zap className="size-6" />}
              title="No stock verification"
              description="Create your first stock verification."
              action={<Button onClick={openNew}><Plus className="size-4" /> New verification</Button>}
            />
          }
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Edit stock verification" : "New stock verification"}</h3>
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
              <Label htmlFor="verification_date">Verification date *</Label>
              <Input
                id="verification_date"
                type="date"
                value={form.verification_date}
                onChange={(e) => setForm({ ...form, verification_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="article_search">Add article line</Label>
            <Input
              id="article_search"
              value={searchArticle}
              onChange={(e) => setSearchArticle(e.target.value)}
              placeholder="Search by article name/code/barcode"
            />
          </div>

          {form.lines.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Verification lines</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Article</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Theoretical</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actual</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Difference</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {form.lines.map((line, index) => (
                      <tr key={line.article_id} className="bg-white">
                        <td className="px-4 py-2 text-sm font-medium">{line.article_name}</td>
                        <td className="px-4 py-2 text-sm">{line.theoretical_quantity ?? "-"}</td>
                        <td className="px-4 py-2 text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={line.quantity}
                            onChange={(e) => updateLineQuantity(index, Number(e.target.value) || 0)}
                            className="w-24 text-center"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {typeof line.theoretical_quantity === "number" ? line.quantity - line.theoretical_quantity : "-"}
                        </td>
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
        <h3 className="font-semibold mb-4">Delete verification</h3>
        <p className="mb-4">This action is irreversible.</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => void del()}>Delete</Button>
        </div>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: !!confirmId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Confirm verification</h3>
        <p className="mb-4">Confirmation applies reconciliation effects and marks verification as final.</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button variant="success" onClick={() => void handleConfirm()}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
