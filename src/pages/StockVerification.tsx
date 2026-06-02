import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, CheckCircle, Zap, Search } from "lucide-react";
import { listStockVerifications, createStockVerification, confirmStockVerification, fmtDinars } from "../api/stockApi";
import { listArticles } from "../api/articleApi";
import { listDepots } from "../api/depotApi";
import { useToastStore } from "../api/toastStore";
import type { StockVerification, CreateStockVerification, Article, Depot } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StockVerification() {
  const [stockVerifications, setStockVerifications] = React.useState<StockVerification[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<StockVerification | null>(null);
  const [confirmId, setConfirmId] = React.useState<StockVerification | null>(null);
  const [form, setForm] = React.useState<CreateStockVerification>({
    depot_id: "",
    verification_date: new Date().toISOString().split('T')[0],
    notes: "",
    lines: [], // Will be populated with article lines
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    load();
    loadArticles();
    loadDepots();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listStockVerifications();
      setStockVerifications(data);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  async function loadArticles() {
    try {
      const data = await listArticles();
      setArticles(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function loadDepots() {
    try {
      const data = await listDepots();
      setDepots(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  function openNew() {
    setEditId(null);
    setForm({
      depot_id: "",
      verification_date: new Date().toISOString().split('T')[0],
      notes: "",
      lines: [],
    });
    setShowForm(true);
  }

  function openEdit(verification: StockVerification) {
    setEditId(verification.id);
    setForm({
      depot_id: verification.depot_id,
      verification_date: verification.verification_date,
      notes: verification.notes,
      lines: verification.lines || [],
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.depot_id || form.lines.length === 0) {
      addToast("Dépôt et au moins une ligne de vérification requis", "error");
      return;
    }
    
    try {
      if (editId) {
        // We don't have an update function for stock verifications yet
        addToast("Modification des vérifications de stock non encore implémentée", "warning");
      } else {
        await createStockVerification(form);
        addToast("Vérification de stock créée", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      // We don't have a delete function for stock verifications yet
      addToast("Suppression des vérifications de stock non encore implémentée", "warning");
      setDeleteId(null);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleConfirm() {
    if (!confirmId) return;
    try {
      await confirmStockVerification(confirmId.id);
      addToast("Vérification de stock confirmée", "success");
      setConfirmId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  // Helper function to add a line for an article
  const addLineForArticle = (article: Article) => {
    // Check if article already exists in lines
    const existingLineIndex = form.lines.findIndex(line => line.article_id === article.id);
    
    if (existingLineIndex >= 0) {
      // If exists, increment quantity by 1
      const updatedLines = [...form.lines];
      updatedLines[existingLineIndex] = {
        ...updatedLines[existingLineIndex],
        quantity: updatedLines[existingLineIndex].quantity + 1
      };
      setForm({ ...form, lines: updatedLines });
    } else {
      // If not exists, add new line with quantity 1
      setForm({ ...form, lines: [...form.lines, {
        article_id: article.id,
        article_name: article.name,
        quantity: 1,
        theoretical_quantity: 0, // Will be filled from system stock
        difference: 0, // Will be calculated later
        status: "pending"
      }] });
    }
  };

  // Helper function to remove a line
  const removeLine = (index: number) => {
    const updatedLines = [...form.lines];
    updatedLines.splice(index, 1);
    setForm({ ...form, lines: updatedLines });
  };

  // Helper function to update line quantity
  const updateLineQuantity = (index: number, quantity: number) => {
    const updatedLines = [...form.lines];
    updatedLines[index] = {
      ...updatedLines[index],
      quantity: quantity
    };
    setForm({ ...form, lines: updatedLines });
  };

  const columns: ColumnDef<StockVerification>[] = [
    {
      accessorKey: "verification_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.verification_date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      accessorKey: "depot_id",
      header: "Dépôt",
      cell: ({ row }) => {
        const depot = depots.find(d => d.id === row.original.depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.depot_id}</span>;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="text-muted-foreground/80">{row.original.notes}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }> = {
          pending: { label: "En attente", variant: "warning" },
          confirmed: { label: "Confirmée", variant: "success" },
          cancelled: { label: "Annulée", variant: "destructive" },
        };
        const statusInfo = statusLabels[row.original.status] || { label: row.original.status, variant: "secondary" };
        return (
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {row.original.status !== "confirmed" && (
            <>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(row.original); }}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </>
          )}
          {row.original.status === "pending" && (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setConfirmId(row.original); }}>
              <CheckCircle className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Vérification de stock"
        description="Effectuez des inventaires physiques pour contrôler vos stocks réels"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvelle vérification
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
          data={stockVerifications}
          searchColumn="search"
          searchPlaceholder="Rechercher par date, dépôt ou notes..."
          emptyState={
            <EmptyState
              icon={<Zap className="size-6" />}
              title="Aucune vérification de stock"
              description="Commencez par effectuer votre première vérification de stock."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle vérification</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing stock verification */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier la vérification de stock" : "Nouvelle vérification de stock"}</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="depot_id">Dépôt *</Label>
              <Select 
                id="depot_id" 
                value={form.depot_id} 
                onValueChange={(v) => setForm({ ...form, depot_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un dépôt" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner un dépôt</SelectItem>
                  {depots.map(depot => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="verification_date">Date de vérification *</Label>
              <Input id="verification_date" type="date" value={form.verification_date} onChange={(e) => setForm({ ...form, verification_date: e.target.value })} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informations complémentaires sur la vérification" />
          </div>
          
          {/* Articles search and selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <Label htmlFor="article_search">Rechercher un article à ajouter</Label>
              </div>
              <div className="flex-1">
                <Input 
                  id="article_search" 
                  placeholder="Rechercher par nom, code ou code-barres..."
                  onChange={(e) => {
                    // In a real implementation, we would call searchArticles here
                    // For now, we'll just filter the local articles list
                    const searchTerm = e.target.value.toLowerCase();
                    if (searchTerm.length >= 2) {
                      const filteredArticles = articles.filter(a =>
                        a.name.toLowerCase().includes(searchTerm) ||
                        a.code.toLowerCase().includes(searchTerm) ||
                        a.barcode.toLowerCase().includes(searchTerm)
                      );
                      // We could show these in a dropdown or autocomplete
                      // For simplicity, we'll just add the first match if there's exactly one
                      if (filteredArticles.length === 1) {
                        addLineForArticle(filteredArticles[0]);
                        e.target.value = ""; // Clear search
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
          
          {/* Lines table */}
          {form.lines.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Articles à vérifier</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantité théorique
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantité réelle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Écart
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {form.lines.map((line, index) => (
                      <tr key={line.article_id} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {line.article_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {line.theoretical_quantity !== undefined ? line.theoretical_quantity : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              min="0" 
                              value={line.quantity} 
                              onChange={(e) => updateLineQuantity(index, Number(e.target.value) || 0)} 
                              className="w-24 text-center"
                            />
                          </td>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {line.theoretical_quantity !== undefined && line.quantity !== undefined ? 
                            (line.quantity - line.theoretical_quantity).toString() : 
                            "—"
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={line.quantity === line.theoretical_quantity ? "text-green-600" : line.quantity !== undefined && line.theoretical_quantity !== undefined ? "text-red-600" : "text-yellow-600"}>
                            {line.quantity === line.theoretical_quantity ? "OK" : line.quantity !== undefined && line.theoretical_quantity !== undefined ? "ÉCART" : "SAISIE"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="icon" onClick={() => removeLine(index)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-4">
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
          Voulez-vous vraiment supprimer la vérification de stock du {new Date(deleteId?.verification_date || 0).toLocaleDateString("fr-FR")} pour le dépôt « {deleteId?.depot_id ? depots.find(d => d.id === deleteId.depot_id)?.name : "—"} » ?
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

      {/* Confirmation dialog for stock verification confirmation */}
      <div className="p-4 bg-card border-t" style={{ display: !!confirmId ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">Confirmer la vérification de stock</h3>
        <p className="mb-4">
          Voulez-vous vraiment confirmer la vérification de stock du {new Date(confirmId?.verification_date || 0).toLocaleDateString("fr-FR")} pour le dépôt « {confirmId?.depot_id ? depots.find(d => d.id === confirmId.depot_id)?.name : "—"} » ?
          Cette action marquera la vérification comme définitive et mettra à jour les stocks théoriques.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setConfirmId(null)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleConfirm}>
            Confirmer
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