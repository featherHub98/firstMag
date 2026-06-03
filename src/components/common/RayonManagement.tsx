import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { listRayons, createRayon, updateRayon, deleteRayon } from "../../api/rayonApi";
import { listDepots } from "../../api/depotApi";
import { useToastStore } from "../../api/toastStore";
import type { CreateRayon, Depot, Rayon } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function RayonManagement() {
  const [rows, setRows] = React.useState<Rayon[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Rayon | null>(null);
  const [form, setForm] = React.useState<CreateRayon>({
    code: "",
    name: "",
    depot_id: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [rayons, depotRows] = await Promise.all([listRayons(), listDepots()]);
      setRows(rayons);
      setDepots(depotRows.filter((d) => d.active));
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    const defaultDepot = depots[0]?.id ?? "";
    setEditId(null);
    setForm({ code: "", name: "", depot_id: defaultDepot, active: true });
    setShowForm(true);
  }

  function openEdit(row: Rayon) {
    setEditId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      depot_id: row.depot_id,
      active: row.active,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.name || !form.depot_id) {
      addToast("Code, nom et depot requis", "error");
      return;
    }
    try {
      if (editId) {
        await updateRayon({ id: editId, ...form });
        addToast("Rayon modifie", "success");
      } else {
        await createRayon(form);
        addToast("Rayon cree", "success");
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
      await deleteRayon(deleteId.id);
      addToast("Rayon supprime", "success");
      setDeleteId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const depotById = React.useMemo(() => new Map(depots.map((d) => [d.id, d])), [depots]);

  const columns: ColumnDef<Rayon>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Rayon",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "depot_id",
      header: "Magasin",
      cell: ({ row }) => <span>{depotById.get(row.original.depot_id)?.name ?? row.original.depot_id}</span>,
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
        title="Gestion des rayons"
        description="Structurez vos rayons par magasin"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouveau rayon
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
          data={rows}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou magasin..."
          emptyState={
            <EmptyState
              icon={<LayoutGrid className="size-6" />}
              title="Aucun rayon"
              description="Commencez par creer votre premier rayon."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau rayon</Button>}
            />
          }
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier le rayon" : "Nouveau rayon"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rayonCode">Code du rayon *</Label>
            <Input id="rayonCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rayonName">Nom du rayon *</Label>
            <Input id="rayonName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rayonDepot">Magasin *</Label>
            <select
              id="rayonDepot"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.depot_id}
              onChange={(e) => setForm({ ...form, depot_id: e.target.value })}
              required
            >
              <option value="" disabled>Selectionner un magasin</option>
              {depots.map((depot) => (
                <option key={depot.id} value={depot.id}>{depot.code} - {depot.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rayonActive">Actif</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rayonActive"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4"
              />
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
        <p className="mb-4">
          Voulez-vous vraiment supprimer le rayon « {deleteId?.name} » ?
          Cette action est irreversible.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button variant="destructive" onClick={() => void del()}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}
