import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Package, ArrowDown, ArrowUp, ArrowRightLeft, ClipboardList, Search } from "lucide-react";
import { searchArticles, getStockLevel, listStockMovements, fmtDinars } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Article, StockMovement } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const typeLabels: Record<string, { label: string; icon: React.ReactNode; variant: "success" | "destructive" | "info" | "secondary" }> = {
  entry: { label: "Entrée", icon: <ArrowDown className="size-3" />, variant: "success" },
  exit: { label: "Sortie", icon: <ArrowUp className="size-3" />, variant: "destructive" },
  transfer: { label: "Transfert", icon: <ArrowRightLeft className="size-3" />, variant: "info" },
  inventory: { label: "Inventaire", icon: <ClipboardList className="size-3" />, variant: "secondary" },
};

export default function StockPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [levels, setLevels] = React.useState<Record<string, number>>({});
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [view, setView] = React.useState<"levels" | "movements">("levels");
  const addToast = useToastStore((s) => s.addToast);

  async function loadArticles() {
    if (!q.trim()) { setArticles([]); return; }
    setLoading(true);
    try {
      const data = await searchArticles(q.trim());
      setArticles(data);
      const lvls: Record<string, number> = {};
      for (const a of data) {
        try { const l = await getStockLevel(a.id); lvls[a.id] = l.quantity; } catch { lvls[a.id] = 0; }
      }
      setLevels(lvls);
    } catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  async function loadAllMovements() {
    setLoading(true);
    try { const data = await listStockMovements(); setMovements(data); }
    catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  React.useEffect(() => {
    if (view === "movements" && movements.length === 0) loadAllMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const levelColumns: ColumnDef<Article>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Article",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.barcode && <span className="text-xs text-muted-foreground font-mono">{row.original.barcode}</span>}
        </div>
      ),
    },
    {
      id: "level",
      header: "Niveau",
      cell: ({ row }) => {
        const qty = levels[row.original.id] ?? 0;
        return (
          <Badge variant={qty > 0 ? "success" : "destructive"} className="font-mono">
            {qty}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sale_price",
      header: "Prix vente",
      cell: ({ row }) => <span className="tabular-nums">{fmtDinars(row.original.sale_price)} D</span>,
    },
  ];

  const movementColumns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
        </span>
      ),
    },
    {
      accessorKey: "movement_type",
      header: "Type",
      cell: ({ row }) => {
        const t = typeLabels[row.original.movement_type];
        return (
          <Badge variant={t?.variant || "secondary"} className="gap-1">
            {t?.icon}
            {t?.label || row.original.movement_type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "article_id",
      header: "Article",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.article_id.slice(0, 8)}</span>,
    },
    {
      accessorKey: "quantity",
      header: "Quantité",
      cell: ({ row }) => (
        <span className={`font-bold tabular-nums ${row.original.movement_type === "entry" ? "text-emerald-600" : row.original.movement_type === "exit" ? "text-rose-600" : ""}`}>
          {row.original.movement_type === "entry" ? "+" : row.original.movement_type === "exit" ? "−" : ""}
          {row.original.quantity}
        </span>
      ),
    },
    {
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) =>
        row.original.reference ? (
          <span className="font-mono text-xs">{row.original.reference}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Stock"
        description="Niveaux et mouvements de stock"
      />

      <Tabs value={view} onValueChange={(v) => setView(v as "levels" | "movements")} className="mb-4">
        <TabsList>
          <TabsTrigger value="levels" className="gap-1.5">
            <Package className="size-4" />
            Niveaux
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-1.5">
            <ArrowRightLeft className="size-4" />
            Mouvements
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "levels" && (
        <>
          <div className="flex gap-2 mb-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") loadArticles(); }}
              placeholder="Rechercher un article (nom, code, code-barres)..."
              className="max-w-md"
            />
            <Button onClick={loadArticles} disabled={loading}>
              <Search className="size-4" />
              Rechercher
            </Button>
          </div>
          {articles.length === 0 ? (
            <EmptyState
              icon={<Package className="size-6" />}
              title={q ? "Aucun article trouvé" : "Recherchez un article"}
              description={q ? "Aucun article ne correspond à votre recherche." : "Tapez un nom, code ou code-barres pour voir les niveaux de stock."}
            />
          ) : (
            <DataTable
              columns={levelColumns}
              data={articles}
              isLoading={loading}
            />
          )}
        </>
      )}

      {view === "movements" && (
        <DataTable
          columns={movementColumns}
          data={movements}
          isLoading={loading}
          emptyState={
            <EmptyState
              icon={<ArrowRightLeft className="size-6" />}
              title="Aucun mouvement"
              description="Il n'y a pas encore eu de mouvement de stock."
            />
          }
        />
      )}
    </div>
  );
}
