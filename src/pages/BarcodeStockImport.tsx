import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Barcode3, Zap, Search } from "lucide-react";
import { listBarcodeImports, createBarcodeImport, confirmBarcodeImport, fmtDinars } from "../api/stockApi";
import { listArticles } from "../api/articleApi";
import { listDepots } from "../api/depotApi";
import { useToastStore } from "../api/toastStore";
import type { BarcodeImport, CreateBarcodeImport, Article, Depot } from "../types";
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

export default function BarcodeStockImport() {
  const [barcodeImports, setBarcodeImports] = React.useState<BarcodeImport[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<BarcodeImport | null>(null);
  const [confirmId, setConfirmId] = React.useState<BarcodeImport | null>(null);
  const [form, setForm] = React.useState<CreateBarcodeImport>({
    depot_id: "",
    import_date: new Date().toISOString().split('T')[0],
    reference: "",
    notes: "",
    lines: [], // Will be populated with barcode scan lines
  });
  const [scannedBarcode, setScannedBarcode] = React.useState("");
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    load();
    loadArticles();
    loadDepots();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listBarcodeImports();
      setBarcodeImports(data);
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
      import_date: new Date().toISOString().split('T')[0],
      reference: "",
      notes: "",
      lines: [],
    });
    setScannedBarcode("");
    setShowForm(true);
  }

  function openEdit(importItem: BarcodeImport) {
    setEditId(importItem.id);
    setForm({
      depot_id: importItem.depot_id,
      import_date: importItem.import_date,
      reference: importItem.reference,
      notes: importItem.notes,
      lines: importItem.lines || [],
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.depot_id || form.lines.length === 0) {
      addToast("Dépôt et au moins une ligne d'importation requis", "error");
      return;
    }
    
    try {
      if (editId) {
        // We don't have an update function for barcode imports yet
        addToast("Modification des importations par code-barres non encore implémentée", "warning");
      } else {
        await createBarcodeImport(form);
        addToast("Importation par code-barres créée", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del() {
    if (!deleteId) return;
    try {
      // We don't have a delete function for barcode imports yet
      addToast("Suppression des importations par code-barres non encore implémentée", "warning");
      setDeleteId(null);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleConfirm() {
    if (!confirmId) return;
    try {
      await confirmBarcodeImport(confirmId.id);
      addToast("Importation par code-barres confirmée", "success");
      setConfirmId(null);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  // Handle barcode scanning (simulated with input for now)
  const handleBarcodeScan = React.useCallback((barcode: string) => {
    // Find article by barcode
    const article = articles.find(a => a.barcode === barcode);
    if (!article) {
      addToast(`Aucun article trouvé avec le code-barres: ${barcode}`, "error");
      setScannedBarcode("");
      return;
    }
    
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
        barcode: article.barcode,
        unit_price: article.sale_price, // Default to sale price, could be configured
        status: "pending"
      }] });
    }
    
    setScannedBarcode(""); // Clear input for next scan
  }, [articles, form.lines]);

  // Handle manual barcode input (for testing without actual scanner)
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && scannedBarcode.trim()) {
      e.preventDefault();
      handleBarcodeScan(scannedBarcode.trim());
    }
  }, [scannedBarcode, handleBarcodeScan]);

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

  const columns: ColumnDef<BarcodeImport>[] = [
    {
      accessorKey: "import_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.import_date).toLocaleDateString("fr-FR")}
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
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) => (
        <span className="text-muted-foreground/80">{row.original.reference}</span>
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
        title="Importation par code-barres"
        description="Importez des articles en stock en scannant leurs code-barres"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvelle importation
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
          data={barcodeImports}
          searchColumn="search"
          searchPlaceholder="Rechercher par date, dépôt ou référence..."
          emptyState={
            <EmptyState
              icon={<Barcode3 className="size-6" />}
              title="Aucune importation par code-barres"
              description="Commencez par effectuer votre première importation par code-barres."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvelle importation</Button>}
            />
          }
        />
      )}

      {/* Form for creating/editing barcode import */}
      <div className="p-4 bg-card border-t" style={{ display: showForm ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">{editId ? "Modifier l'importation par code-barres" : "Nouvelle importation par code-barres"}</h3>
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
              <Label htmlFor="import_date">Date d'importation *</Label>
              <Input id="import_date" type="date" value={form.import_date} onChange={(e) => setForm({ ...form, import_date: e.target.value })} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="reference">Référence (optionnel)</Label>
            <Input id="reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Bon de livraison #123" />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informations complémentaires sur l'importation" />
          </div>
          
          {/* Barcode scanning section */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <Label htmlFor="barcode_scan">Scanner un code-barres</Label>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    id="barcode_scan"
                    placeholder="Scannez ou entrez un code-barres..."
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-4 h-12 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    inputMode="text"
                  />
                  <Barcode3 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                </div>
                {scannedBarcode && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dernier scan: <code className="bg-muted px-2 py-0.5 rounded">{scannedBarcode}</code>
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Appuyez sur Entrée après chaque scan pour ajouter l'article à l'importation.
            </p>
          </div>
          
          {/* Lines table */}
          {form.lines.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Articles à importer</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Code-barres
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total
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
                          {line.barcode || "—"}
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
                          {fmtDinars(line.unit_price || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {fmtDinars((line.unit_price || 0) * line.quantity)}
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
          Voulez-vous vraiment supprimer l'importation par code-barres du {new Date(deleteId?.import_date || 0).toLocaleDateString("fr-FR")} pour le dépôt « {deleteId?.depot_id ? depots.find(d => d.id === deleteId.depot_id)?.name : "—"} » ?
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

      {/* Confirmation dialog for barcode import confirmation */}
      <div className="p-4 bg-card border-t" style={{ display: !!confirmId ? 'block' : 'none' }}>
        <h3 className="font-semibold mb-4">Confirmer l'importation par code-barres</h3>
        <p className="mb-4">
          Voulez-vous vraiment confirmer l'importation par code-barres du {new Date(confirmId?.import_date || 0).toLocaleDateString("fr-FR")} pour le dépôt « {confirmId?.depot_id ? depots.find(d => d.id === confirmId.depot_id)?.name : "—"} » ?
          Cette action marquera l'importation comme définitive et mettra à jour les stocks réels.
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