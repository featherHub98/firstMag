import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, BookCopy } from "lucide-react";
import {
  createAccountingCategory,
  deleteAccountingCategory,
  listAccountingCategories,
  updateAccountingCategory,
} from "../../api/accountingCategoryApi";
import { useToastStore } from "../../api/toastStore";
import type { AccountingCategory, CreateAccountingCategory } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountingCategoryManagement() {
  const [rows, setRows] = React.useState<AccountingCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<AccountingCategory | null>(null);
  const [form, setForm] = React.useState<CreateAccountingCategory>({
    code: "",
    name: "",
    account_number: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRows(await listAccountingCategories());
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", account_number: "", active: true });
    setShowForm(true);
  }

  function openEdit(row: AccountingCategory) {
    setEditId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      account_number: row.account_number,
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
        await updateAccountingCategory({ id: editId, ...form });
        addToast("Categorie comptable modifiee", "success");
      } else {
        await createAccountingCategory(form);
        addToast("Categorie comptable creee", "success");
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
      await deleteAccountingCategory(deleteId.id);
      setDeleteId(null);
      addToast("Categorie comptable supprimee", "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<AccountingCategory>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Nom", cell: ({ row }) => <span>{row.original.name}</span> },
    { accessorKey: "account_number", header: "Compte", cell: ({ row }) => <span className="font-mono">{row.original.account_number || "-"}</span> },
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
        title="Categories comptables"
        description="Classification comptable des operations"
        actions={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle categorie</Button>}
      />
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-10 max-w-sm" /><Skeleton className="h-96" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou compte..."
          emptyState={<EmptyState icon={<BookCopy className="size-6" />} title="Aucune categorie" description="Commencez par creer votre premiere categorie comptable." action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle categorie</Button>} />}
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la categorie comptable" : "Nouvelle categorie comptable"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="accCode">Code *</Label><Input id="accCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="accName">Nom *</Label><Input id="accName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="accNum">Numero de compte</Label><Input id="accNum" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="accActive">Actif</Label><div className="flex items-center gap-2"><input id="accActive" type="checkbox" className="h-4 w-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /></div></div>
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
