import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Grid3X3 } from "lucide-react";
import { listGondolas, createGondola, updateGondola, deleteGondola } from "../../api/gondolaApi";
import { listDepots } from "../../api/depotApi";
import { listRayons } from "../../api/rayonApi";
import { useToastStore } from "../../api/toastStore";
import type { CreateGondola, Depot, Gondola, Rayon } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function GondolaManagement() {
  const [rows, setRows] = React.useState<Gondola[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [rayons, setRayons] = React.useState<Rayon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Gondola | null>(null);
  const [form, setForm] = React.useState<CreateGondola>({
    code: "",
    name: "",
    depot_id: "",
    rayon_id: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [gondolas, depotRows, rayonRows] = await Promise.all([
        listGondolas(),
        listDepots(),
        listRayons(),
      ]);
      setRows(gondolas);
      setDepots(depotRows.filter((d) => d.active));
      setRayons(rayonRows.filter((r) => r.active));
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    const defaultDepot = depots[0]?.id ?? "";
    const defaultRayon = rayons.find((r) => r.depot_id === defaultDepot)?.id ?? rayons[0]?.id ?? "";
    setEditId(null);
    setForm({
      code: "",
      name: "",
      depot_id: defaultDepot,
      rayon_id: defaultRayon,
      active: true,
    });
    setShowForm(true);
  }

  function openEdit(row: Gondola) {
    setEditId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      depot_id: row.depot_id,
      rayon_id: row.rayon_id,
      active: row.active,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.name || !form.depot_id || !form.rayon_id) {
      addToast("Code, nom, magasin et rayon requis", "error");
      return;
    }
    try {
      if (editId) {
        await updateGondola({ id: editId, ...form });
        addToast("Gondole modifiee", "success");
      } else {
        await createGondola(form);
        addToast("Gondole creee", "success");
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
      await deleteGondola(deleteId.id);
      addToast("Gondole supprimee", "success");
      setDeleteId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const depotById = React.useMemo(() => new Map(depots.map((d) => [d.id, d])), [depots]);
  const rayonById = React.useMemo(() => new Map(rayons.map((r) => [r.id, r])), [rayons]);
  const availableRayons = React.useMemo(
    () => rayons.filter((r) => r.depot_id === form.depot_id),
    [rayons, form.depot_id],
  );

  const columns: ColumnDef<Gondola>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Gondole",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "depot_id",
      header: "Magasin",
      cell: ({ row }) => <span>{depotById.get(row.original.depot_id)?.name ?? row.original.depot_id}</span>,
    },
    {
      accessorKey: "rayon_id",
      header: "Rayon",
      cell: ({ row }) => <span>{rayonById.get(row.original.rayon_id)?.name ?? row.original.rayon_id}</span>,
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
        title="Gestion des gondoles"
        description="Organisez les emplacements physiques dans chaque rayon"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvelle gondole
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
          searchPlaceholder="Rechercher par code, nom, magasin ou rayon..."
          emptyState={
            <EmptyState
              icon={<Grid3X3 className="size-6" />}
              title="Aucune gondole"
              description="Commencez par creer votre premiere gondole."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle gondole</Button>}
            />
          }
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la gondole" : "Nouvelle gondole"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gondolaCode">Code de la gondole *</Label>
            <Input id="gondolaCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gondolaName">Nom de la gondole *</Label>
            <Input id="gondolaName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gondolaDepot">Magasin *</Label>
              <select
                id="gondolaDepot"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.depot_id}
                onChange={(e) => {
                  const depotId = e.target.value;
                  const fallbackRayon = rayons.find((r) => r.depot_id === depotId)?.id ?? "";
                  setForm({ ...form, depot_id: depotId, rayon_id: fallbackRayon });
                }}
                required
              >
                <option value="" disabled>Selectionner un magasin</option>
                {depots.map((depot) => (
                  <option key={depot.id} value={depot.id}>{depot.code} - {depot.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gondolaRayon">Rayon *</Label>
              <select
                id="gondolaRayon"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.rayon_id}
                onChange={(e) => setForm({ ...form, rayon_id: e.target.value })}
                required
              >
                <option value="" disabled>Selectionner un rayon</option>
                {availableRayons.map((rayon) => (
                  <option key={rayon.id} value={rayon.id}>{rayon.code} - {rayon.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gondolaActive">Actif</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gondolaActive"
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
          Voulez-vous vraiment supprimer la gondole « {deleteId?.name} » ?
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
