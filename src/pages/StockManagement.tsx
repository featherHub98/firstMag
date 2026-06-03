import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, PackagePlus, PackageMinus, Repeat, Truck } from "lucide-react";
import {
  listStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from "../api/stockApi";
import { listArticles } from "../api/articleApi";
import { listDepots } from "../api/depotApi";
import { useToastStore } from "../api/toastStore";
import type { StockMovement, CreateStockMovement, Article, Depot } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE_OPTION = "__none__";

export default function StockManagement() {
  const [stockMovements, setStockMovements] = React.useState<StockMovement[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<StockMovement | null>(null);
  const [form, setForm] = React.useState<CreateStockMovement>({
    article_id: "",
    source_depot_id: null,
    destination_depot_id: null,
    quantity: 0,
    movement_type: "entry",
    reference: "",
    notes: "",
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    load();
    loadArticles();
    loadDepots();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listStockMovements();
      setStockMovements(data);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadArticles() {
    try {
      const data = await listArticles();
      setArticles(data);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadDepots() {
    try {
      const data = await listDepots();
      setDepots(data);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  function openNew() {
    setEditId(null);
    setForm({
      article_id: "",
      source_depot_id: null,
      destination_depot_id: null,
      quantity: 0,
      movement_type: "entry",
      reference: "",
      notes: "",
    });
    setShowForm(true);
  }

  function openEdit(movement: StockMovement) {
    setEditId(movement.id);
    setForm({
      article_id: movement.article_id,
      source_depot_id: movement.source_depot_id,
      destination_depot_id: movement.destination_depot_id,
      quantity: movement.quantity,
      movement_type: movement.movement_type,
      reference: movement.reference,
      notes: movement.notes,
    });
    setShowForm(true);
  }

  function validateForm(): string | null {
    if (!form.article_id || form.quantity <= 0) return "Article and quantity are required";
    if (form.movement_type === "entry" && !form.destination_depot_id) {
      return "Destination depot is required for entry";
    }
    if (form.movement_type === "exit" && !form.source_depot_id) {
      return "Source depot is required for exit";
    }
    if (form.movement_type === "transfer" && (!form.source_depot_id || !form.destination_depot_id)) {
      return "Source and destination depots are required for transfer";
    }
    if (
      form.movement_type === "transfer" &&
      form.source_depot_id &&
      form.destination_depot_id &&
      form.source_depot_id === form.destination_depot_id
    ) {
      return "Source and destination depots must be different for transfer";
    }
    return null;
  }

  async function save() {
    const validationError = validateForm();
    if (validationError) {
      addToast(validationError, "error");
      return;
    }

    try {
      if (editId) {
        await updateStockMovement({ id: editId, ...form });
        addToast("Stock movement updated", "success");
      } else {
        await createStockMovement(form);
        addToast("Stock movement created", "success");
      }
      setShowForm(false);
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteStockMovement(deleteId.id);
      addToast("Stock movement deleted", "success");
      setDeleteId(null);
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "movement_type",
      header: "Type",
      cell: ({ row }) => {
        const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
          entry: { label: "Entry", icon: <PackagePlus className="size-2" /> },
          exit: { label: "Exit", icon: <PackageMinus className="size-2" /> },
          transfer: { label: "Transfer", icon: <Repeat className="size-2" /> },
        };
        const typeInfo = typeLabels[row.original.movement_type] || { label: row.original.movement_type, icon: <></> };
        return (
          <span className="flex items-center gap-1">
            {typeInfo.icon}
            <span>{typeInfo.label}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "article_id",
      header: "Article",
      cell: ({ row }) => {
        const article = articles.find((a) => a.id === row.original.article_id);
        return article ? (
          <span className="font-medium">{article.name}</span>
        ) : (
          <span className="text-muted-foreground/40">ID: {row.original.article_id}</span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => <span className="tabular-nums">{row.original.quantity}</span>,
    },
    {
      accessorKey: "source_depot_id",
      header: "Source depot",
      cell: ({ row }) => {
        if (!row.original.source_depot_id) return <span className="text-muted-foreground/40">-</span>;
        const depot = depots.find((d) => d.id === row.original.source_depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.source_depot_id}</span>;
      },
    },
    {
      accessorKey: "destination_depot_id",
      header: "Destination depot",
      cell: ({ row }) => {
        if (!row.original.destination_depot_id) return <span className="text-muted-foreground/40">-</span>;
        const depot = depots.find((d) => d.id === row.original.destination_depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.destination_depot_id}</span>;
      },
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => <span className="text-muted-foreground/80">{row.original.reference}</span>,
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(row.original); }}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Stock movements"
        description="Track entry, exit, and transfer operations"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New movement
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
          data={stockMovements}
          searchColumn="search"
          searchPlaceholder="Search by article, reference, or depot..."
          emptyState={
            <EmptyState
              icon={<Truck className="size-6" />}
              title="No stock movements"
              description="Create your first stock movement."
              action={<Button onClick={openNew}><Plus className="size-4" /> New movement</Button>}
            />
          }
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit stock movement" : "New stock movement"}</DialogTitle>
            <DialogDescription>
              Register entry, exit, or transfer movement.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="article_id">Article *</Label>
              <Select
                value={form.article_id || NONE_OPTION}
                onValueChange={(v) => setForm({ ...form, article_id: v === NONE_OPTION ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select article" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Select article</SelectItem>
                  {articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.name} ({article.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="movement_type">Movement type *</Label>
              <Select
                value={form.movement_type}
                onValueChange={(v) => setForm({ ...form, movement_type: v as CreateStockMovement["movement_type"] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="exit">Exit</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="Delivery #123"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source_depot_id">Source depot</Label>
              <Select
                value={form.source_depot_id || NONE_OPTION}
                onValueChange={(v) => setForm({ ...form, source_depot_id: v === NONE_OPTION ? null : v })}
              >
                <SelectTrigger><SelectValue placeholder="Optional source depot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Optional source depot</SelectItem>
                  {depots.map((depot) => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="destination_depot_id">Destination depot</Label>
              <Select
                value={form.destination_depot_id || NONE_OPTION}
                onValueChange={(v) =>
                  setForm({ ...form, destination_depot_id: v === NONE_OPTION ? null : v })
                }
              >
                <SelectTrigger><SelectValue placeholder="Optional destination depot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Optional destination depot</SelectItem>
                  {depots.map((depot) => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional information"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this stock movement?"
        description={deleteId ? `Movement "${deleteId.movement_type}" will be permanently deleted.` : ""}
        confirmLabel="Delete"
        onConfirm={del}
        destructive
      />
    </div>
  );
}
