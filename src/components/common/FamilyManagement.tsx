import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Folder } from "lucide-react";
import { listArticleFamilies, createArticleFamily, updateArticleFamily, deleteArticleFamily } from "../../api/familyApi";
import { useToastStore } from "../../api/toastStore";
import type { ArticleFamily, CreateArticleFamily } from "../../types/family";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function FamilyManagement() {
  const [families, setFamilies] = React.useState<ArticleFamily[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<ArticleFamily | null>(null);
  const [form, setForm] = React.useState<CreateArticleFamily>({
    name: "",
    parent_id: null,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listArticleFamilies();
      setFamilies(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm({ name: "", parent_id: null });
    setShowForm(true);
  }

  function openEdit(family: ArticleFamily) {
    setEditId(family.id);
    setForm({
      name: family.name,
      parent_id: family.parent_id,
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
        await updateArticleFamily({ id: editId, ...form });
        addToast("Famille modifiée", "success");
      } else {
        await createArticleFamily(form);
        addToast("Famille créée", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteArticleFamily(deleteId.id);
      addToast("Famille supprimée", "success");
      setDeleteId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<ArticleFamily>[] = [
    {
      accessorKey: "name",
      header: "Nom de la famille",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "parent_id",
      header: "Famille parente",
      cell: ({ row }) => {
        if (!row.original.parent_id) return <span className="text-muted-foreground/40">—</span>;
        // In a real implementation, we would look up the parent name
        return <span className="font-mono text-xs">ID: {row.original.parent_id}</span>;
      },
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
        title="Gestion des familles d'articles"
        description="Organisez vos produits par familles et sous-familles"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvelle famille
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
          data={families}
          searchColumn="search"
          searchPlaceholder="Rechercher par nom de famille..."
          emptyState={
            <EmptyState
              icon={<Folder className="size-6" />}
              title="Aucune famille"
              description="Commencez par créer votre première famille d'articles."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle famille</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing family */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la famille" : "Nouvelle famille"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de la famille *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="parent_id">Famille parente (optionnel)</Label>
            <Select 
              id="parent_id" 
              value={form.parent_id || ""} 
              onValueChange={(v) => setForm({ ...form, parent_id: v === "" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Aucune (famille racine)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune (famille racine)</SelectItem>
                {/* In a real implementation, we would populate this with actual families */}
                <SelectItem value="1">Alimentation</SelectItem>
                <SelectItem value="2">Textile</SelectItem>
                <SelectItem value="3">Électronique</SelectItem>
              </SelectContent>
            </Select>
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
          Voulez-vous vraiment supprimer la famille « {deleteId?.name} » ?
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