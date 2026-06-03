import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { listSalespersons, createSalesperson, updateSalesperson, deleteSalesperson } from "../../api/salespersonApi";
import { useToastStore } from "../../api/toastStore";
import type { Salesperson, CreateSalesperson } from "../../types/salesperson";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalespersonManagement() {
  const [salespersons, setSalespersons] = React.useState<Salesperson[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Salesperson | null>(null);
  const [form, setForm] = React.useState<CreateSalesperson>({
    code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listSalespersons();
      setSalespersons(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm({ 
      code: "", 
      first_name: "", 
      last_name: "", 
      email: "", 
      phone: "", 
      active: true 
    });
    setShowForm(true);
  }

  function openEdit(salesperson: Salesperson) {
    setEditId(salesperson.id);
    setForm({
      code: salesperson.code,
      first_name: salesperson.first_name,
      last_name: salesperson.last_name,
      email: salesperson.email,
      phone: salesperson.phone,
      active: salesperson.active,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.first_name || !form.last_name) {
      addToast("Code, prénom et nom requis", "error");
      return;
    }
    try {
      if (editId) {
        await updateSalesperson({ id: editId, ...form });
        addToast("Vendeur modifié", "success");
      } else {
        await createSalesperson(form);
        addToast("Vendeur créé", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteSalesperson(deleteId.id);
      addToast("Vendeur supprimé", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<Salesperson>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "first_name",
      header: "Prénom",
      cell: ({ row }) => <span>{row.original.first_name}</span>,
    },
    {
      accessorKey: "last_name",
      header: "Nom",
      cell: ({ row }) => <span>{row.original.last_name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground/80">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => (
        <span className="text-muted-foreground/80">{row.original.phone}</span>
      ),
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
        title="Gestion des vendeurs"
        description="Gérez vos vendeurs et représentants commerciaux"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouveau vendeur
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
          data={salespersons}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, prénom, nom, email ou téléphone..."
          emptyState={
            <EmptyState
              icon={<UserPlus className="size-6" />}
              title="Aucun vendeur"
              description="Commencez par créer votre premier vendeur."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau vendeur</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing salesperson */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier le vendeur" : "Nouveau vendeur"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code du vendeur *</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="V001" required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Jean" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Nom *</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Dupont" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean.dupont@entreprise.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+216 XX XXX XXX" />
            </div>
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
          Voulez-vous vraiment supprimer le vendeur « {deleteId?.first_name} {deleteId?.last_name} » ?
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

