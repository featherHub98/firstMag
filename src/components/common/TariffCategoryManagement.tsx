import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import {
  createTariffCategory,
  deleteTariffCategory,
  listTariffCategories,
  updateTariffCategory,
} from "../../api/tariffCategoryApi";
import { useToastStore } from "../../api/toastStore";
import type { CreateTariffCategory, TariffCategory } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function TariffCategoryManagement() {
  const [rows, setRows] = React.useState<TariffCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<TariffCategory | null>(null);
  const [form, setForm] = React.useState<CreateTariffCategory>({
    code: "",
    name: "",
    discount_rate: 0,
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRows(await listTariffCategories());
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", discount_rate: 0, active: true });
    setShowForm(true);
  }

  function openEdit(row: TariffCategory) {
    setEditId(row.id);
    setForm({ code: row.code, name: row.name, discount_rate: row.discount_rate, active: row.active });
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.name) {
      addToast("Code et nom requis", "error");
      return;
    }
    try {
      if (editId) {
        await updateTariffCategory({ id: editId, ...form });
        addToast("Categorie tarifaire modifiee", "success");
      } else {
        await createTariffCategory(form);
        addToast("Categorie tarifaire creee", "success");
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
      await deleteTariffCategory(deleteId.id);
      setDeleteId(null);
      addToast("Categorie tarifaire supprimee", "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<TariffCategory>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Nom", cell: ({ row }) => <span>{row.original.name}</span> },
    { accessorKey: "discount_rate", header: "Remise (%)", cell: ({ row }) => <span className="font-mono">{row.original.discount_rate}</span> },
    { accessorKey: "active", header: "Actif", cell: ({ row }) => <span className={row.original.active ? "text-green-600" : "text-red-600"}>{row.original.active ? "Oui" : "Non"}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(row.original); }}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Categories tarifaires"
        description="Segmentation des tarifs et remises"
        actions={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle categorie</Button>}
      />
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-10 max-w-sm" /><Skeleton className="h-96" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchColumn="search"
          searchPlaceholder="Rechercher par code ou nom..."
          emptyState={<EmptyState icon={<Tags className="size-6" />} title="Aucune categorie" description="Commencez par creer votre premiere categorie tarifaire." action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle categorie</Button>} />}
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la categorie tarifaire" : "Nouvelle categorie tarifaire"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="tariffCode">Code *</Label><Input id="tariffCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="tariffName">Nom *</Label><Input id="tariffName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="tariffDiscount">Remise (%)</Label><Input id="tariffDiscount" type="number" min={0} max={100} value={form.discount_rate} onChange={(e) => setForm({ ...form, discount_rate: parseInt(e.target.value || "0", 10) })} /></div>
          <div className="space-y-1.5"><Label htmlFor="tariffActive">Actif</Label><div className="flex items-center gap-2"><input id="tariffActive" type="checkbox" className="h-4 w-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /></div></div>
          <div className="flex justify-end space-x-3"><Button variant="outline" type="button" onClick={() => setShowForm(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
        </form>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: deleteId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Confirmer la suppression</h3>
        <p className="mb-4">Voulez-vous vraiment supprimer la categorie « {deleteId?.name} » ?</p>
        <div className="flex justify-end space-x-3"><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="destructive" onClick={() => void del()}>Supprimer</Button></div>
      </div>
    </div>
  );
}
