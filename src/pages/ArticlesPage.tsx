import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Package, X } from "lucide-react";
import {
  listArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  listArticleCodes,
  createArticleCode,
  createArticleBomHeader,
  createArticleBomLine,
  deleteArticleBomLine,
  deleteArticleCode,
  listArticleBomHeaders,
  listArticleBomLines,
  fmtDinars,
} from "../api";
import { listArticleFamilies } from "../api/familyApi";
import { listUnitsOfMeasure } from "../api/unitOfMeasureApi";
import { useToastStore } from "../api/toastStore";
import type {
  Article,
  CreateArticle,
  ArticleFamily,
  UnitOfMeasure,
  ArticleCode,
  ArticleBomHeader,
  ArticleBomLine,
} from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

export default function ArticlesPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [families, setFamilies] = React.useState<ArticleFamily[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = React.useState<UnitOfMeasure[]>([]);
  const [articleCodesByArticle, setArticleCodesByArticle] = React.useState<Record<string, ArticleCode[]>>({});
  const [editingCodes, setEditingCodes] = React.useState<ArticleCode[]>([]);
  const [additionalCodes, setAdditionalCodes] = React.useState("");
  const [bomHeaders, setBomHeaders] = React.useState<ArticleBomHeader[]>([]);
  const [selectedBomId, setSelectedBomId] = React.useState<string | null>(null);
  const [bomLines, setBomLines] = React.useState<ArticleBomLine[]>([]);
  const [newBomName, setNewBomName] = React.useState("");
  const [newBomOutputQty, setNewBomOutputQty] = React.useState("1.000");
  const [newBomComponentId, setNewBomComponentId] = React.useState<string>("__none__");
  const [newBomComponentQty, setNewBomComponentQty] = React.useState("1.000");
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<Article | null>(null);
  const [form, setForm] = React.useState<CreateArticle>({
    code: "",
    barcode: "",
    name: "",
    purchase_price: 0,
    sale_price: 0,
    family_id: null,
    sub_family_id: null,
    tax_rate_id: null,
    unit_of_measure_id: null,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
    void loadFamilies();
    void loadUnitsOfMeasure();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [data, codes] = await Promise.all([listArticles(), listArticleCodes()]);
      setArticles(data);
      const grouped: Record<string, ArticleCode[]> = {};
      for (const code of codes) {
        if (!grouped[code.article_id]) grouped[code.article_id] = [];
        grouped[code.article_id].push(code);
      }
      setArticleCodesByArticle(grouped);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadFamilies() {
    try {
      const data = await listArticleFamilies();
      setFamilies(data);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadUnitsOfMeasure() {
    try {
      const data = await listUnitsOfMeasure();
      setUnitsOfMeasure(data);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  function openNew() {
    setEditId(null);
    setForm({
      code: "",
      barcode: "",
      name: "",
      purchase_price: 0,
      sale_price: 0,
      family_id: null,
      sub_family_id: null,
      tax_rate_id: null,
      unit_of_measure_id: null,
    });
    setEditingCodes([]);
    setAdditionalCodes("");
    setBomHeaders([]);
    setSelectedBomId(null);
    setBomLines([]);
    setNewBomName("");
    setNewBomOutputQty("1.000");
    setNewBomComponentId("__none__");
    setNewBomComponentQty("1.000");
    setShowForm(true);
  }

  async function openEdit(article: Article) {
    setEditId(article.id);
    setForm({
      code: article.code,
      barcode: article.barcode,
      name: article.name,
      purchase_price: article.purchase_price,
      sale_price: article.sale_price,
      family_id: article.family_id,
      sub_family_id: article.sub_family_id,
      tax_rate_id: article.tax_rate_id,
      unit_of_measure_id: article.unit_of_measure_id,
    });
    try {
      setEditingCodes(await listArticleCodes(article.id));
    } catch (e) {
      addToast(String(e), "error");
      setEditingCodes([]);
    }
    try {
      const headers = await listArticleBomHeaders(article.id);
      setBomHeaders(headers);
      const activeHeader = headers.find((h) => h.active) ?? headers[0] ?? null;
      setSelectedBomId(activeHeader?.id ?? null);
      if (activeHeader) {
        setBomLines(await listArticleBomLines(activeHeader.id));
      } else {
        setBomLines([]);
      }
    } catch (e) {
      addToast(String(e), "error");
      setBomHeaders([]);
      setSelectedBomId(null);
      setBomLines([]);
    }
    setNewBomName("");
    setNewBomOutputQty("1.000");
    setNewBomComponentId("__none__");
    setNewBomComponentQty("1.000");
    setAdditionalCodes("");
    setShowForm(true);
  }

  function parseAdditionalCodes(raw: string): string[] {
    return Array.from(
      new Set(
        raw
          .split(/[,\n; ]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      ),
    );
  }

  function inferCodeType(code: string): "barcode" | "plu" {
    return /^\d{1,5}$/.test(code) ? "plu" : "barcode";
  }

  async function save() {
    if (!form.code || !form.name) {
      addToast("Code et nom requis", "error");
      return;
    }
    try {
      let articleId = editId;
      if (editId) {
        const updated = await updateArticle({ id: editId, ...form });
        articleId = updated.id;
        addToast("Article modifie", "success");
      } else {
        const created = await createArticle(form);
        articleId = created.id;
        addToast("Article cree", "success");
      }

      if (articleId) {
        const codes = parseAdditionalCodes(additionalCodes);
        for (const code of codes) {
          await createArticleCode({
            article_id: articleId,
            code,
            code_type: inferCodeType(code),
          });
        }
      }

      setShowForm(false);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function removeExistingCode(item: ArticleCode) {
    try {
      await deleteArticleCode(item.id);
      setEditingCodes((prev) => prev.filter((c) => c.id !== item.id));
      setArticleCodesByArticle((prev) => ({
        ...prev,
        [item.article_id]: (prev[item.article_id] || []).filter((c) => c.id !== item.id),
      }));
      addToast("Code supprime", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function refreshBomLinesForSelection(bomId: string | null) {
    if (!bomId) {
      setBomLines([]);
      return;
    }
    try {
      setBomLines(await listArticleBomLines(bomId));
    } catch (e) {
      addToast(String(e), "error");
      setBomLines([]);
    }
  }

  async function createBomHeader() {
    if (!editId) return;
    const name = newBomName.trim();
    if (!name) {
      addToast("Nom de nomenclature requis", "error");
      return;
    }
    try {
      const created = await createArticleBomHeader({
        parent_article_id: editId,
        name,
        output_quantity: Math.max(1, Math.round((parseFloat(newBomOutputQty) || 0) * 1000)),
      });
      const headers = await listArticleBomHeaders(editId);
      setBomHeaders(headers);
      setSelectedBomId(created.id);
      setNewBomName("");
      await refreshBomLinesForSelection(created.id);
      addToast("Nomenclature creee", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function addBomLine() {
    if (!selectedBomId) {
      addToast("Selectionnez une nomenclature", "error");
      return;
    }
    if (!newBomComponentId || newBomComponentId === "__none__") {
      addToast("Selectionnez un composant", "error");
      return;
    }
    try {
      await createArticleBomLine({
        bom_id: selectedBomId,
        component_article_id: newBomComponentId,
        quantity: Math.max(1, Math.round((parseFloat(newBomComponentQty) || 0) * 1000)),
      });
      setNewBomComponentId("__none__");
      setNewBomComponentQty("1.000");
      await refreshBomLinesForSelection(selectedBomId);
      addToast("Composant ajoute", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function removeBomLine(lineId: string) {
    try {
      await deleteArticleBomLine(lineId);
      setBomLines((prev) => prev.filter((line) => line.id !== lineId));
      addToast("Composant supprime", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function del() {
    if (!deleteId) return;
    try {
      await deleteArticle(deleteId.id);
      addToast("Article supprime", "success");
      setDeleteId(null);
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "barcode",
      header: "Code-barres",
      cell: ({ row }) =>
        row.original.barcode ? (
          <span className="font-mono text-xs text-muted-foreground">{row.original.barcode}</span>
        ) : (
          <span className="text-muted-foreground/40">-</span>
        ),
    },
    {
      id: "alt_codes",
      header: "Codes secondaires",
      cell: ({ row }) => {
        const codes = articleCodesByArticle[row.original.id] || [];
        if (codes.length === 0) return <span className="text-muted-foreground/40">-</span>;
        const preview = codes.slice(0, 2).map((c) => c.code).join(", ");
        return (
          <span className="text-xs text-muted-foreground">
            {preview}
            {codes.length > 2 ? ` +${codes.length - 2}` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "purchase_price",
      header: "Prix achat",
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">{fmtDinars(row.original.purchase_price)} D</span>
      ),
    },
    {
      accessorKey: "sale_price",
      header: "Prix vente",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">{fmtDinars(row.original.sale_price)} D</span>
      ),
    },
    {
      accessorKey: "family_id",
      header: "Famille",
      cell: ({ row }) => {
        if (!row.original.family_id) return <span className="text-muted-foreground/40">-</span>;
        const family = families.find((f) => f.id === row.original.family_id);
        return family ? <span>{family.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.family_id}</span>;
      },
    },
    {
      accessorKey: "unit_of_measure_id",
      header: "Unite",
      cell: ({ row }) => {
        if (!row.original.unit_of_measure_id) return <span className="text-muted-foreground/40">-</span>;
        const unit = unitsOfMeasure.find((u) => u.id === row.original.unit_of_measure_id);
        return unit ? <span>{unit.name} ({unit.symbol})</span> : <span className="text-muted-foreground/40">ID: {row.original.unit_of_measure_id}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); void openEdit(row.original); }}>
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
        title="Articles"
        description="Catalogue des produits"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouvel article
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
          data={articles}
          searchColumn="search"
          searchPlaceholder="Rechercher par nom, code, barcode ou PLU..."
          emptyState={
            <EmptyState
              icon={<Package className="size-6" />}
              title="Aucun article"
              description="Creez votre premier article."
              action={<Button onClick={openNew}><Plus className="size-4" /> Nouvel article</Button>}
            />
          }
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
            <DialogDescription>Renseignez les informations du produit.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code">Code</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode">Code-barres principal</Label>
                <Input id="barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="purchase">Prix achat (D)</Label>
                <Input
                  id="purchase"
                  type="number"
                  step="0.001"
                  value={form.purchase_price / 1000}
                  onChange={(e) => setForm({ ...form, purchase_price: Math.round((parseFloat(e.target.value) || 0) * 1000) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sale">Prix vente (D)</Label>
                <Input
                  id="sale"
                  type="number"
                  step="0.001"
                  value={form.sale_price / 1000}
                  onChange={(e) => setForm({ ...form, sale_price: Math.round((parseFloat(e.target.value) || 0) * 1000) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit_of_measure_id">Unite de mesure</Label>
              <Select
                value={form.unit_of_measure_id ?? "__none__"}
                onValueChange={(v) => setForm({ ...form, unit_of_measure_id: v === "__none__" ? null : v })}
              >
                <SelectTrigger><SelectValue placeholder="Selectionner une unite" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selectionner une unite</SelectItem>
                  {unitsOfMeasure.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="family_id">Famille</Label>
                <Select
                  value={form.family_id ?? "__none__"}
                  onValueChange={(v) => setForm({ ...form, family_id: v === "__none__" ? null : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Aucune famille" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucune famille</SelectItem>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={family.id}>
                        {family.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub_family_id">Sous-famille</Label>
                <Select
                  value={form.sub_family_id ?? "__none__"}
                  onValueChange={(v) => setForm({ ...form, sub_family_id: v === "__none__" ? null : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Aucune sous-famille" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucune sous-famille</SelectItem>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={family.id}>
                        {family.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editId && editingCodes.length > 0 && (
              <div className="space-y-1.5">
                <Label>Codes secondaires existants</Label>
                <div className="flex flex-wrap gap-2">
                  {editingCodes.map((item) => (
                    <Badge key={item.id} variant="secondary" className="gap-1">
                      {item.code}
                      <button type="button" onClick={() => void removeExistingCode(item)} aria-label={`Supprimer ${item.code}`}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="additional_codes">Codes secondaires (PLU ou code-barres)</Label>
              <Input
                id="additional_codes"
                value={additionalCodes}
                onChange={(e) => setAdditionalCodes(e.target.value)}
                placeholder="1234, 6199990001112, 22001"
              />
            </div>

            {editId && (
              <div className="space-y-2 rounded-md border p-3">
                <Label className="font-medium">Nomenclature / BOM</Label>

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={newBomName}
                    onChange={(e) => setNewBomName(e.target.value)}
                    placeholder="Nom nomenclature"
                  />
                  <Input
                    type="number"
                    step="0.001"
                    value={newBomOutputQty}
                    onChange={(e) => setNewBomOutputQty(e.target.value)}
                    placeholder="QtÃ© sortie"
                  />
                  <Button type="button" onClick={() => void createBomHeader()}>
                    Ajouter nomenclature
                  </Button>
                </div>

                {bomHeaders.length > 0 && (
                  <>
                    <div className="space-y-1.5">
                      <Label>Selection nomenclature</Label>
                      <Select
                        value={selectedBomId ?? "__none__"}
                        onValueChange={(v) => {
                          const next = v === "__none__" ? null : v;
                          setSelectedBomId(next);
                          void refreshBomLinesForSelection(next);
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Choisir nomenclature" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Aucune</SelectItem>
                          {bomHeaders.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name} ({fmtDinars(h.output_quantity)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBomId && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <Select value={newBomComponentId} onValueChange={setNewBomComponentId}>
                            <SelectTrigger><SelectValue placeholder="Composant" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Composant</SelectItem>
                              {articles
                                .filter((a) => a.id !== editId)
                                .map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.code} - {a.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="0.001"
                            value={newBomComponentQty}
                            onChange={(e) => setNewBomComponentQty(e.target.value)}
                            placeholder="QtÃ© composant"
                          />
                          <Button type="button" onClick={() => void addBomLine()}>
                            Ajouter composant
                          </Button>
                        </div>

                        <div className="space-y-1">
                          {bomLines.map((line) => {
                            const component = articles.find((a) => a.id === line.component_article_id);
                            return (
                              <div key={line.id} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                                <span>
                                  {component ? `${component.code} - ${component.name}` : line.component_article_id}
                                  {" "}
                                  x {fmtDinars(line.quantity)}
                                </span>
                                <Button type="button" variant="ghost" size="icon" onClick={() => void removeBomLine(line.id)}>
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </div>
                            );
                          })}
                          {bomLines.length === 0 && (
                            <div className="text-xs text-muted-foreground">Aucun composant.</div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={() => void save()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer cet article ?"
        description={deleteId ? `L'article "${deleteId.name}" sera supprime.` : ""}
        confirmLabel="Supprimer"
        onConfirm={del}
        destructive
      />
    </div>
  );
}
