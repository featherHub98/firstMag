import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, PackagePlus, PackageMinus, Repeat, Truck } from "lucide-react";
import { listStockMovements, createStockMovement, fmtDinars } from "../api/stockApi";
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
    movement_type: "entry", // entry, exit, transfer
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
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  async function loadArticles() {
    try {
      const data = await listArticles();
      setArticles(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function loadDepots() {
    try {
      const data = await listDepots();
      setDepots(data);
    } catch (e) { addToast(String(e), "error"); }
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

  async function save() {
    if (!form.article_id || form.quantity <= 0) {
      addToast("Article et quantité requis", "error");
      return;
    }
    
    // Validate based on movement type
    if (form.movement_type === "entry" && !form.destination_depot_id) {
      addToast("Dépôt de destination requis pour une entrée", "error");
      return;
    }
    
    if (form.movement_type === "exit" && !form.source_depot_id) {
      addToast("Dépôt de source requis pour une sortie", "error");
      return;
    }
    
    if (form.movement_type === "transfer" && (!form.source_depot_id || !form.destination_depot_id)) {
      addToast("Dépôts de source et de destination requis pour un transfert", "error");
      return;
    }
    
    try {
      if (editId) {
        // We don't have an update function for stock movements yet, but we'll add it
        addToast("Modification des mouvements de stock non encore implémentée", "warning");
      } else {
        await createStockMovement(form);
        addToast("Mouvement de stock enregistré", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      // We don't have a delete function for stock movements yet
      addToast("Suppression des mouvements de stock non encore implémentée", "warning");
      setDeleteId(null);
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "movement_type",
      header: "Type",
      cell: ({ row }) => {
        const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
          entry: { label: "Entrée", icon: <PackagePlus className="size-2" /> },
          exit: { label: "Sortie", icon: <PackageMinus className="size-2" /> },
          transfer: { label: "Transfert", icon: <Repeat className="size-2" /> },
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
        const article = articles.find(a => a.id === row.original.article_id);
        return article ? (
          <span className="font-medium">{article.name}</span>
        ) : (
          <span className="text-muted-foreground/40">ID: {row.original.article_id}</span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantité",
      cell: ({ row }) => <span className="tabular-nums">{row.original.quantity}</span>,
    },
    {
      accessorKey: "source_depot_id",
      header: "Dépôt source",
      cell: ({ row }) => {
        if (!row.original.source_depot_id) return <span className="text-muted-foreground/40">—</span>;
        const depot = depots.find(d => d.id === row.original.source_depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.source_depot_id}</span>;
      },
    },
    {
      accessorKey: "destination_depot_id",
      header: "Dépôt destination",
      cell: ({ row }) => {
        if (!row.original.destination_depot_id) return <span className="text-muted-foreground/40">—</span>;
        const depot = depots.find(d => d.id === row.original.destination_depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.destination_depot_id}</span>;
      },
    },
    {
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) => (
        <span className="text-muted-foreground/80">{row.original.reference}</span>
      ),
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
        title="Gestion des mouvements de stock"
        description="Suivez les entrées, sorties et transferts de vos articles"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouveau mouvement
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
          searchPlaceholder="Rechercher par article, référence ou dépôts..."
          emptyState={
            <EmptyState
              icon={<Truck className="size-6" />}
              title="Aucun mouvement de stock"
              description="Commencez par enregistrer votre premier mouvement de stock."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau mouvement</Button>}
            />
          }
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le mouvement de stock" : "Nouveau mouvement de stock"}</DialogTitle>
            <DialogDescription>
              Enregistrez un mouvement de stock (entrée, sortie ou transfert).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="article_id">Article *</Label>
              <Select 
                id="article_id" 
                value={form.article_id} 
                onValueChange={(v) => setForm({ ...form, article_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un article" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner un article</SelectItem>
                  {articles.map(article => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.name} ({article.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="movement_type">Type de mouvement *</Label>
              <Select 
                id="movement_type" 
                value={form.movement_type} 
                onValueChange={(v) => setForm({ ...form, movement_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entrée</SelectItem>
                  <SelectItem value="exit">Sortie</SelectItem>
                  <SelectItem value="transfer">Transfert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input id="quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })} />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="reference">Référence (optionnel)</Label>
              <Input id="reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Bon de livraison #123" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* These fields will be conditionally shown based on movement type */}
            <div className="space-y-1.5">
              <Label htmlFor="source_depot_id">Dépôt source</Label>
              <Select 
                id="source_depot_id" 
                value={form.source_depot_id || ""} 
                onValueChange={(v) => setForm({ ...form, source_depot_id: v === "" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un dépôt source (optionnel)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner un dépôt source (optionnel)</SelectItem>
                  {depots.map(depot => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="destination_depot_id">Dépôt destination</Label>
              <Select 
                id="destination_depot_id" 
                value={form.destination_depot_id || ""} 
                onValueChange={(v) => setForm({ ...form, destination_depot_id: v === "" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un dépôt destination (optionnel)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner un dépôt destination (optionnel)</SelectItem>
                  {depots.map(depot => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informations complémentaires" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={save}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer ce mouvement de stock ?"
        description={deleteId ? `Le mouvement de stock « ${deleteId.movement_type} » sera définitivement supprimé.` : ""}
        confirmLabel="Supprimer"
        onConfirm={del}
        destructive
      />
    </div>
  );
}

// Import Select component (we'll need to create this or use an existing one)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import Skeleton (we'll need to create this or use an existing one)
import { Skeleton } from "@/components/ui/skeleton";