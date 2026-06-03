import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BarChart2, RefreshCw } from "lucide-react";
import { listStockReports } from "../api/stockApi";
import { listArticles } from "../api/articleApi";
import { listDepots } from "../api/depotApi";
import { useToastStore } from "../api/toastStore";
import type { StockReport, Article, Depot } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE_OPTION = "__none__";

export default function StockReports() {
  const [stockReports, setStockReports] = React.useState<StockReport[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [depots, setDepots] = React.useState<Depot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterDepotId, setFilterDepotId] = React.useState<string | null>(null);
  const [filterArticleId, setFilterArticleId] = React.useState<string | null>(null);
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void loadReports();
    void loadArticles();
    void loadDepots();
  }, [filterDepotId, filterArticleId, dateFrom, dateTo]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await listStockReports({
        depot_id: filterDepotId,
        article_id: filterArticleId,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setStockReports(data);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadArticles() {
    try {
      const data = await listArticles();
      setArticles(data);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadDepots() {
    try {
      const data = await listDepots();
      setDepots(data);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  function handleResetFilters() {
    setFilterDepotId(null);
    setFilterArticleId(null);
    setDateFrom("");
    setDateTo("");
  }

  const columns: ColumnDef<StockReport>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {new Date(row.original.date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      accessorKey: "depot_id",
      header: "Depot",
      cell: ({ row }) => {
        const depot = depots.find((d) => d.id === row.original.depot_id);
        return depot ? <span>{depot.name}</span> : <span className="text-muted-foreground/40">ID: {row.original.depot_id}</span>;
      },
    },
    {
      accessorKey: "article_id",
      header: "Article",
      cell: ({ row }) => {
        const article = articles.find((a) => a.id === row.original.article_id);
        return article ? (
          <span className="font-medium">{article.name}</span>
        ) : (
          <span className="text-muted-foreground/40">ID: {row.original.article_id}</span>
        );
      },
    },
    {
      accessorKey: "initial_quantity",
      header: "Stock initial",
      cell: ({ row }) => <span className="tabular-nums">{row.original.initial_quantity}</span>,
    },
    {
      accessorKey: "entries_quantity",
      header: "Entrees",
      cell: ({ row }) => <span className="tabular-nums text-green-600">{row.original.entries_quantity}</span>,
    },
    {
      accessorKey: "exits_quantity",
      header: "Sorties",
      cell: ({ row }) => <span className="tabular-nums text-red-600">{row.original.exits_quantity}</span>,
    },
    {
      accessorKey: "final_quantity",
      header: "Stock final",
      cell: ({ row }) => <span className="tabular-nums font-semibold">{row.original.final_quantity}</span>,
    },
    {
      accessorKey: "variance",
      header: "Ecart",
      cell: ({ row }) => {
        const variance = row.original.variance;
        return (
          <span className={`tabular-nums ${variance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {variance >= 0 ? "+" : ""}
            {variance}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Rapports de stock"
        description="Analysez les mouvements et l evolution des stocks par periode"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleResetFilters} variant="outline" size="icon">
              <RefreshCw className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="border-b bg-card p-4">
        <div className="grid gap-4">
          <div className="grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="filterDepot">Depot</Label>
              <Select value={filterDepotId || NONE_OPTION} onValueChange={(v) => setFilterDepotId(v === NONE_OPTION ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Tous les depots" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Tous les depots</SelectItem>
                  {depots.map((depot) => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filterArticle">Article</Label>
              <Select value={filterArticleId || NONE_OPTION} onValueChange={(v) => setFilterArticleId(v === NONE_OPTION ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Tous les articles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Tous les articles</SelectItem>
                  {articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.name} ({article.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateFrom">Du</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateTo">Au</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={handleResetFilters}>
              Reinitialiser
            </Button>
            <Button onClick={loadReports}>Appliquer les filtres</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 max-w-sm" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={stockReports}
            searchColumn="search"
            searchPlaceholder="Rechercher par article ou depot..."
            emptyState={
              <EmptyState
                icon={<BarChart2 className="size-6" />}
                title="Aucun rapport de stock"
                description="Aucun rapport de stock ne correspond aux filtres selectionnes."
                action={<Button onClick={handleResetFilters}><RefreshCw className="size-4" /> Tout afficher</Button>}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
