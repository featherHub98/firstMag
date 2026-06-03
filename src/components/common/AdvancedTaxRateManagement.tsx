import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Percent } from "lucide-react";
import {
  createAdvancedTaxRate,
  deleteAdvancedTaxRate,
  listAdvancedTaxRates,
  updateAdvancedTaxRate,
} from "../../api/advancedTaxRateApi";
import { useToastStore } from "../../api/toastStore";
import type { AdvancedTaxRate, CreateAdvancedTaxRate } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvancedTaxRateManagement() {
  const [rows, setRows] = React.useState<AdvancedTaxRate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<AdvancedTaxRate | null>(null);
  const [form, setForm] = React.useState<CreateAdvancedTaxRate>({
    code: "",
    name: "",
    rate: 0,
    surcharge_rate: 0,
    withholding_rate: 0,
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRows(await listAdvancedTaxRates());
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", rate: 0, surcharge_rate: 0, withholding_rate: 0, active: true });
    setShowForm(true);
  }

  function openEdit(row: AdvancedTaxRate) {
    setEditId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      rate: row.rate,
      surcharge_rate: row.surcharge_rate,
      withholding_rate: row.withholding_rate,
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
        await updateAdvancedTaxRate({ id: editId, ...form });
        addToast("Taxe avancee modifiee", "success");
      } else {
        await createAdvancedTaxRate(form);
        addToast("Taxe avancee creee", "success");
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
      await deleteAdvancedTaxRate(deleteId.id);
      setDeleteId(null);
      addToast("Taxe avancee supprimee", "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<AdvancedTaxRate>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Nom", cell: ({ row }) => <span>{row.original.name}</span> },
    { accessorKey: "rate", header: "TVA (%)", cell: ({ row }) => <span className="font-mono">{row.original.rate}</span> },
    { accessorKey: "surcharge_rate", header: "Surcharge (%)", cell: ({ row }) => <span className="font-mono">{row.original.surcharge_rate}</span> },
    { accessorKey: "withholding_rate", header: "Retenue (%)", cell: ({ row }) => <span className="font-mono">{row.original.withholding_rate}</span> },
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
        title="Taxes avancees"
        description="TVA, surcharge et retenue a la source"
        actions={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle taxe</Button>}
      />
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-10 max-w-sm" /><Skeleton className="h-96" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchColumn="search"
          searchPlaceholder="Rechercher par code ou nom..."
          emptyState={<EmptyState icon={<Percent className="size-6" />} title="Aucune taxe avancee" description="Commencez par creer votre premiere taxe avancee." action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle taxe</Button>} />}
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la taxe avancee" : "Nouvelle taxe avancee"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="taxCode">Code *</Label><Input id="taxCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="taxName">Nom *</Label><Input id="taxName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label htmlFor="taxRate">TVA (%)</Label><Input id="taxRate" type="number" min={0} max={100} value={form.rate} onChange={(e) => setForm({ ...form, rate: parseInt(e.target.value || "0", 10) })} /></div>
            <div className="space-y-1.5"><Label htmlFor="taxSurcharge">Surcharge (%)</Label><Input id="taxSurcharge" type="number" min={0} max={100} value={form.surcharge_rate} onChange={(e) => setForm({ ...form, surcharge_rate: parseInt(e.target.value || "0", 10) })} /></div>
            <div className="space-y-1.5"><Label htmlFor="taxWh">Retenue (%)</Label><Input id="taxWh" type="number" min={0} max={100} value={form.withholding_rate} onChange={(e) => setForm({ ...form, withholding_rate: parseInt(e.target.value || "0", 10) })} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="taxActive">Actif</Label><div className="flex items-center gap-2"><input id="taxActive" type="checkbox" className="h-4 w-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /></div></div>
          <div className="flex justify-end space-x-3"><Button variant="outline" type="button" onClick={() => setShowForm(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
        </form>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: deleteId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Confirmer la suppression</h3>
        <p className="mb-4">Voulez-vous vraiment supprimer la taxe « {deleteId?.name} » ?</p>
        <div className="flex justify-end space-x-3"><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="destructive" onClick={() => void del()}>Supprimer</Button></div>
      </div>
    </div>
  );
}
