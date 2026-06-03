import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { listDepots, createDepot, updateDepot, deleteDepot } from "../../api/depotApi";
import { useToastStore } from "../../api/toastStore";
import type { Depot, CreateDepot } from "../../types/depot";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepotManagement() {
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Depot | null>(null);
  const [form, setForm] = React.useState<CreateDepot>({
    code: "",
    name: "",
    address: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listDepots();
      setDepots(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", address: "", active: true });
    setShowForm(true);
  }

  function openEdit(depot: Depot) {
    setEditId(depot.id);
    setForm({
      code: depot.code,
      name: depot.name,
      address: depot.address,
      active: depot.active,
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
        await updateDepot({ id: editId, ...form });
        addToast("Dépôt modifié", "success");
      } else {
        await createDepot(form);
        addToast("Dépôt créé", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteDepot(deleteId.id);
      addToast("Dépôt supprimé", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<Depot>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom du dépôt",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "address",
      header: "Adresse",
      cell: ({ row }) => <span>{row.original.address}</span>,
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
        title="Gestion des dépôts/magasins"
        description="Gérez vos différents points de vente et entrepôts"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouveau dépôt
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
          data={depots}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou adresse..."
          emptyState={
            <EmptyState
              icon={<MapPin className="size-6" />}
              title="Aucun dépôt"
              description="Commencez par créer votre premier dépôt."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau dépôt</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing depot */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier le dépôt" : "Nouveau dépôt"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code du dépôt *</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DEP001" required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom du dépôt *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Magasin Central" required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
          Voulez-vous vraiment supprimer le dépôt « {deleteId?.name} » ?
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

