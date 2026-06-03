import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Zap } from "lucide-react";
import { listUnitsOfMeasure, createUnitOfMeasure, updateUnitOfMeasure, deleteUnitOfMeasure } from "../../api/unitOfMeasureApi";
import { useToastStore } from "../../api/toastStore";
import type { UnitOfMeasure, CreateUnitOfMeasure } from "../../types/unitOfMeasure";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitOfMeasureManagement() {
  const [units, setUnits] = React.useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<UnitOfMeasure | null>(null);
  const [form, setForm] = React.useState<CreateUnitOfMeasure>({
    name: "",
    symbol: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listUnitsOfMeasure();
      setUnits(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm({ name: "", symbol: "", active: true });
    setShowForm(true);
  }

  function openEdit(unit: UnitOfMeasure) {
    setEditId(unit.id);
    setForm({
      name: unit.name,
      symbol: unit.symbol,
      active: unit.active,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name) {
      addToast("Nom requis", "error");
      return;
    }
    try {
      if (editId) {
        await updateUnitOfMeasure({ id: editId, ...form });
        addToast("Unité de mesure modifiée", "success");
      } else {
        await createUnitOfMeasure(form);
        addToast("Unité de mesure créée", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteUnitOfMeasure(deleteId.id);
      addToast("Unité de mesure supprimée", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<UnitOfMeasure>[] = [
    {
      accessorKey: "name",
      header: "Nom de l'unité",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "symbol",
      header: "Symbole",
      cell: ({ row }) => <span>{row.original.symbol}</span>,
    },
    {
      accessorKey: "active",
      header: "Actif",
      cell: ({ row }) => (
        <span className={row.original.active ? "text-green-600" : "text-red-600"}>
          {row.original.active ? "Oui" : "Non"}
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
        title="Gestion des unités de mesure"
        description="Définissez les unités utilisées pour vos articles (kg, pcs, L, etc.)"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvelle unité
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
          data={units}
          searchColumn="search"
          searchPlaceholder="Rechercher par nom ou symbole..."
          emptyState={
            <EmptyState
              icon={<Zap className="size-6" />}
              title="Aucune unité de mesure"
              description="Commencez par créer votre première unité de mesure."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle unité</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing unit of measure */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier l'unité de mesure" : "Nouvelle unité de mesure"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de l'unité *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="symbol">Symbole (ex: kg, pcs, L)</Label>
            <Input id="symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="kg" />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="active">Actif</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>

      {/* Confirmation dialog for deletion */}
      <div className="p-4 bg-card border-t" style={{ display: !!deleteId ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">Confirmer la suppression</h3>
        <p className="mb-4">
          Voulez-vous vraiment supprimer l'unité de mesure « {deleteId?.name} » ?
          Cette action est irréversible.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={del}>
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

