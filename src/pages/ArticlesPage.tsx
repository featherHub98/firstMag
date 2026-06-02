import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { listArticles, createArticle, updateArticle, deleteArticle, fmtDinars } from "../api";
import { listArticleFamilies } from "../api/familyApi";
import { listUnitsOfMeasure } from "../api/unitOfMeasureApi";
import { useToastStore } from "../api/toastStore";
import type { Article, CreateArticle, ArticleFamily, UnitOfMeasure } from "../types";
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

export default function ArticlesPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [families, setFamilies] = React.useState<ArticleFamily[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = React.useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Article | null>(null);
  const [form, setForm] = React.useState<CreateArticle>({
    code: "", barcode: "", name: "", 
    purchase_price: 0, sale_price: 0,
    family_id: null, sub_family_id: null, tax_rate_id: null,
    unit_of_measure_id: null,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    load();
    loadFamilies();
    loadUnitsOfMeasure();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listArticles();
      setArticles(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  async function loadFamilies() {
    try {
      const data = await listArticleFamilies();
      setFamilies(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function loadUnitsOfMeasure() {
    try {
      const data = await listUnitsOfMeasure();
      setUnitsOfMeasure(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  function openNew() {
    setEditId(null);
    setForm({ 
      code: "", barcode: "", name: "", 
      purchase_price: 0, sale_price: 0,
      family_id: null, sub_family_id: null, tax_rate_id: null,
      unit_of_measure_id: null,
    });
    setShowForm(true);
  }

  function openEdit(a: Article) {
    setEditId(a.id);
    setForm({
      code: a.code, barcode: a.barcode, name: a.name,
      purchase_price: a.purchase_price, sale_price: a.sale_price,
      family_id: a.family_id, sub_family_id: a.sub_family_id, tax_rate_id: a.tax_rate_id,
      unit_of_measure_id: a.unit_of_measure_id,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.name) {
      addToast("Code et nom requis", "error");
      return;
    }
    try {
      if (editId) {
        await updateArticle({ id: editId, ...form });
        addToast("Article modifié", "success");
      } else {
        await createArticle(form);
        addToast("Article créé", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteArticle(deleteId.id);
      addToast("Article supprimé", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "barcode",
      header: "Code-barres",
      cell: ({ row }) =>
        row.original.barcode ? (
          <span className="font-mono text-xs text-muted-foreground">{row.original.barcode}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        ),
    },
    {
      accessorKey: "purchase_price",
      header: "Prix achat",
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">{fmtDinars(row.original.purchase_price)} D</span>
      ),
    },
    {
      accessorKey: "sale_price",
      header: "Prix vente",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">{fmtDinars(row.original.sale_price)} D</span>
      ),
    },
    {
      accessorKey: "family_id",
      header: "Famille",
      cell: ({ row }) => {
        if (!row.original.family_id) return <span className="text-muted-foreground/40">—</span>;
        const family = families.find(f => f.id === row.original.family_id);
        return family ? <span>{family.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.family_id}</span>;
      },
    },
    {
      accessorKey: "sub_family_id",
      header: "Sous-famille",
      cell: ({ row }) => {
        if (!row.original.sub_family_id) return <span className="text-muted-foreground/40">—</span>;
        const family = families.find(f => f.id === row.original.sub_family_id);
        return family ? <span>{family.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.sub_family_id}</span>;
      },
    },
    {
      accessorKey: "unit_of_measure_id",
      header: "Unité de mesure",
      cell: ({ row }) => {
        if (!row.original.unit_of_measure_id) return <span className="text-muted-foreground/40">—</span>;
        const unit = unitsOfMeasure.find(u => u.id === row.original.unit_of_measure_id);
        return unit ? <span>{unit.name} ({unit.symbol})</span> : <span className="text-muted-foreground/40">ID: {row.original.unit_of_measure_id}</span>;
      },
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
        title="Articles"
        description="Catalogue des produits et marchandises"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvel article
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
          data={articles}
          searchColumn="search"
          searchPlaceholder="Rechercher par nom, code ou code-barres..."
          emptyState={
            <EmptyState
              icon={<Package className="size-6" />}
              title="Aucun article"
              description="Commencez par créer votre premier article."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvel article</Button>}
            />
          }
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
            <DialogDescription>
              Renseignez les informations du produit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code">Code</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ART001" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode">Code-barres</Label>
                <Input id="barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="613012345678" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du produit" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="purchase">Prix achat (D)</Label>
                <Input id="purchase" type="number" step="0.001" value={form.purchase_price / 1000} onChange={(e) => setForm({ ...form, purchase_price: Math.round((parseFloat(e.target.value) || 0) * 1000) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sale">Prix vente (D)</Label>
                <Input id="sale" type="number" step="0.001" value={form.sale_price / 1000} onChange={(e) => setForm({ ...form, sale_price: Math.round((parseFloat(e.target.value) || 0) * 1000) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit_of_measure_id">Unité de mesure</Label>
              <Select 
                id="unit_of_measure_id" 
                value={form.unit_of_measure_id || ""} 
                onValueChange={(v) => setForm({ ...form, unit_of_measure_id: v === "" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une unité" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner une unité</SelectItem>
                  {unitsOfMeasure.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="family_id">Famille</Label>
              <Select 
                id="family_id" 
                value={form.family_id || ""} 
                onValueChange={(v) => setForm({ ...form, family_id: v === "" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Aucune famille" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune famille</SelectItem>
                  {families.map(family => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub_family_id">Sous-famille</Label>
              <Select 
                id="sub_family_id" 
                value={form.sub_family_id || ""} 
                onValueChange={(v) => setForm({ ...form, sub_family_id: v === "" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Aucune sous-famille" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune sous-famille</SelectItem>
                  {families.map(family => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
        title="Supprimer cet article ?"
        description={deleteId ? `L'article « ${deleteId.name} » sera définitivement supprimé.` : ""}
        confirmLabel="Supprimer"
        onConfirm={del}
        destructive
      />
    </div>
  );
}