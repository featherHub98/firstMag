import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { listPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "../../api/paymentMethodApi";
import { useToastStore } from "../../api/toastStore";
import type { PaymentMethod, CreatePaymentMethod } from "../../types/paymentMethod";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentMethodManagement() {
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<PaymentMethod | null>(null);
  const [form, setForm] = React.useState<CreatePaymentMethod>({
    code: "",
    name: "",
    description: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listPaymentMethods();
      setPaymentMethods(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", description: "", active: true });
    setShowForm(true);
  }

  function openEdit(paymentMethod: PaymentMethod) {
    setEditId(paymentMethod.id);
    setForm({
      code: paymentMethod.code,
      name: paymentMethod.name,
      description: paymentMethod.description,
      active: paymentMethod.active,
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
        await updatePaymentMethod({ id: editId, ...form });
        addToast("Mode de paiement modifié", "success");
      } else {
        await createPaymentMethod(form);
        addToast("Mode de paiement créé", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deletePaymentMethod(deleteId.id);
      addToast("Mode de paiement supprimé", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<PaymentMethod>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom du mode de paiement",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-muted-foreground/80">{row.original.description}</span>,
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
        title="Gestion des modes de paiement"
        description="Configurez les différents moyens de paiement acceptés"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouveau mode de paiement
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
          data={paymentMethods}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou description..."
          emptyState={
            <EmptyState
              icon={<CreditCard className="size-6" />}
              title="Aucun mode de paiement"
              description="Commencez par créer votre premier mode de paiement."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau mode de paiement</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing payment method */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier le mode de paiement" : "Nouveau mode de paiement"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code du mode de paiement *</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="PM001" required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom du mode de paiement *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Espèces" required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Paiement en espèces" />
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
          Voulez-vous vraiment supprimer le mode de paiement « {deleteId?.name} » ?
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

