import * as React from "react";
import {
  Package, Users as UsersIcon, Tags, FileText, TrendingUp,
} from "lucide-react";
import { getDashboardStats, fmtDinars } from "../api";
import { useToastStore } from "../api/toastStore";
import type { DashboardStats } from "../types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => addToast(String(e), "error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité"
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16 mt-2" /></CardHeader></Card>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Articles</CardTitle>
                <Tags className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_articles}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.priced_articles} avec prix
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
                <UsersIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_clients}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tiers enregistrés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Valeur stock (PA)</CardTitle>
                <Package className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmtDinars(stats.stock_value_pa)} DT</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prix d'achat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Valeur stock (PV)</CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmtDinars(stats.stock_value_pv)} DT</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prix de vente
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents récents</CardTitle>
              <CardDescription>{stats.total_documents} documents au total</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recent_documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun document</p>
              ) : (
                <div className="space-y-3">
                  {stats.recent_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.doc_number}</p>
                          <p className="text-xs text-muted-foreground truncate">{doc.partner_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">{doc.doc_type}</Badge>
                        <span className="text-sm font-semibold tabular-nums">{fmtDinars(doc.total_ttc)} DT</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-muted-foreground">Impossible de charger les données.</p>
      )}
    </div>
  );
}
