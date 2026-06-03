import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Globe2 } from "lucide-react";
import { createCountry, deleteCountry, listCountries, updateCountry } from "../../api/countryApi";
import { useToastStore } from "../../api/toastStore";
import type { Country, CreateCountry } from "../../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function CountryManagement() {
  const [rows, setRows] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Country | null>(null);
  const [form, setForm] = React.useState<CreateCountry>({
    code: "",
    name: "",
    iso2: "",
    phone_code: "",
    active: true,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRows(await listCountries());
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", name: "", iso2: "", phone_code: "", active: true });
    setShowForm(true);
  }

  function openEdit(row: Country) {
    setEditId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      iso2: row.iso2,
      phone_code: row.phone_code,
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
        await updateCountry({ id: editId, ...form });
        addToast("Pays modifie", "success");
      } else {
        await createCountry(form);
        addToast("Pays cree", "success");
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
      await deleteCountry(deleteId.id);
      setDeleteId(null);
      addToast("Pays supprime", "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<Country>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Nom", cell: ({ row }) => <span>{row.original.name}</span> },
    { accessorKey: "iso2", header: "ISO2", cell: ({ row }) => <span className="font-mono text-xs">{row.original.iso2}</span> },
    { accessorKey: "phone_code", header: "Indicatif", cell: ({ row }) => <span className="font-mono text-xs">{row.original.phone_code || "-"}</span> },
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
        title="Pays"
        description="Referentiel des pays"
        actions={<Button onClick={openNew}><Plus className="size-4" /> Nouveau pays</Button>}
      />
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-10 max-w-sm" /><Skeleton className="h-96" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchColumn="search"
          searchPlaceholder="Rechercher par code, nom ou ISO..."
          emptyState={<EmptyState icon={<Globe2 className="size-6" />} title="Aucun pays" description="Commencez par creer votre premier pays." action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau pays</Button>} />}
        />
      )}

      <div className="p-4 bg-card border-t" style={{ display: showForm ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier le pays" : "Nouveau pays"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="countryCode">Code *</Label><Input id="countryCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label htmlFor="countryIso2">ISO2</Label><Input id="countryIso2" value={form.iso2} onChange={(e) => setForm({ ...form, iso2: e.target.value.toUpperCase() })} maxLength={2} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="countryName">Nom *</Label><Input id="countryName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="countryPhoneCode">Indicatif</Label><Input id="countryPhoneCode" value={form.phone_code} onChange={(e) => setForm({ ...form, phone_code: e.target.value })} placeholder="+216" /></div>
          <div className="space-y-1.5"><Label htmlFor="countryActive">Actif</Label><div className="flex items-center gap-2"><input id="countryActive" type="checkbox" className="h-4 w-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /></div></div>
          <div className="flex justify-end space-x-3"><Button variant="outline" type="button" onClick={() => setShowForm(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
        </form>
      </div>

      <div className="p-4 bg-card border-t" style={{ display: deleteId ? "block" : "none" }}>
        <h3 className="font-semibold mb-4">Confirmer la suppression</h3>
        <p className="mb-4">Voulez-vous vraiment supprimer le pays « {deleteId?.name} » ?</p>
        <div className="flex justify-end space-x-3"><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="destructive" onClick={() => void del()}>Supprimer</Button></div>
      </div>
    </div>
  );
}
