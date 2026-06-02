import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { listCurrencies, createCurrency, updateCurrency, deleteCurrency } from "../../api/currencyApi";
import { useToastStore } from "../../api/toastStore";
import type { Currency, CreateCurrency } from "../../types/currency";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CurrencyManagement() {
  const [currencies, setCurrencies] = React.useState<Currency[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Currency | null>(null);
  const [form, setForm] = React.useState<CreateCurrency>({
    code: "",
    name: "",
    symbol: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listCurrencies();
      setCurrencies(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", symbol: "", active: true });
    setShowForm(true);
  }

  function openEdit(currency: Currency) {
    setEditId(currency.id);
    setForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      active: currency.active,
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
        await updateCurrency({ id: editId, ...form });
        addToast("Devise modifiée", "success");
      } else {
        await createCurrency(form);
        addToast("Devise créée", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteCurrency(deleteId.id);
      addToast("Devise supprimée", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<Currency>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom de la devise",
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
        title="Gestion des devises"
        description="Configurez les devises utilisées dans votre système"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvelle devise
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
          data={currencies}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou symbole..."
          emptyState={
            <EmptyState
              icon={<DollarSign className="size-6" />}
              title="Aucune devise"
              description="Commencez par créer votre première devise."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle devise</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing currency */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la devise" : "Nouvelle devise"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code de la devise *</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="USD" required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de la devise *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dollar américain" required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="symbol">Symbole (ex: $, €, £)</Label>
            <Input id="symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="$" />
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
          Voulez-vous vraiment supprimer la devise « {deleteId?.name} » ?
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

// Import Select component (we'll need to create this or use an existing one)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import Skeleton (we'll need to create this or use an existing one)
import { Skeleton } from "@/components/ui/skeleton";