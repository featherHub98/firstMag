import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import {
  createProductRange,
  deleteProductRange,
  listProductRanges,
  updateProductRange,
} from "../../api/productRangeApi";
import { useToastStore } from "../../api/toastStore";
import type { CreateProductRange, ProductRange } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductRangeManagement() {
  const [rows, setRows] = React.useState<ProductRange[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<ProductRange | null>(null);
  const [form, setForm] = React.useState<CreateProductRange>({
    code: "",
    name: "",
    description: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRows(await listProductRanges());
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", description: "", active: true });
    setShowForm(true);
  }

  function openEdit(row: ProductRange) {
    setEditId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      description: row.description,
      active: row.active,
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
        await updateProductRange({ id: editId, ...form });
        addToast("Gamme modifiee", "success");
      } else {
        await createProductRange(form);
        addToast("Gamme creee", "success");
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
      await deleteProductRange(deleteId.id);
      setDeleteId(null);
      addToast("Gamme supprimee", "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<ProductRange>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    { accessorKey: "name", header: "Nom", cell: ({ row }) => <span>{row.original.name}</span> },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || "-"}</span>,
    },
    {
      accessorKey: "active",
      header: "Actif",
      cell: ({ row }) => <span className={row.original.active ? "text-green-600" : "text-red-600"}>{row.original.active ? "Oui" : "Non"}</span>,
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
        title="Gammes"
        description="Gestion des gammes produits"
        actions={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle gamme</Button>}
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 max-w-sm" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou description..."
          emptyState={
            <EmptyState
              icon={<Layers className="size-6" />}
              title="Aucune gamme"
              description="Commencez par creer votre premiere gamme."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle gamme</Button>}
            />
          }
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la gamme" : "Nouvelle gamme"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rangeCode">Code *</Label>
            <Input id="rangeCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rangeName">Nom *</Label>
            <Input id="rangeName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rangeDescription">Description</Label>
            <Input id="rangeDescription" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rangeActive">Actif</Label>
            <div className="flex items-center gap-2">
              <input id="rangeActive" type="checkbox" className="h-4 w-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: deleteId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Confirmer la suppression</h3>
        <p className="mb-4">Voulez-vous vraiment supprimer la gamme « {deleteId?.name} » ?</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button variant="destructive" onClick={() => void del()}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}
