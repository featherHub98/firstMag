import * as React from "react";
import { BarChart3, FileBarChart, Printer, TrendingUp, ShoppingBag, Receipt, CreditCard, FileText, Banknote } from "lucide-react";
import { getXReport, getZReport, printReport, fmtDinars } from "../api";
import { useToastStore } from "../api/toastStore";
import type { SaleReport } from "../types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function ReportsPage() {
  const [report, setReport] = React.useState<SaleReport | null>(null);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const addToast = useToastStore((s) => s.addToast);

  async function loadX() {
    setLoading(true);
    try { const r = await getXReport(); setReport(r); setTitle("Rapport X"); }
    catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  async function loadZ() {
    setLoading(true);
    try { const r = await getZReport(); setReport(r); setTitle("Rapport Z"); }
    catch (e) { addToast(String(e), "error"); }
    finally { setLoading(false); }
  }

  const paymentData = report ? [
    { name: "Espèces", value: report.cash_total, color: "var(--color-chart-1)" },
    { name: "Carte", value: report.card_total, color: "var(--color-chart-2)" },
    { name: "Chèque", value: report.cheque_total, color: "var(--color-chart-3)" },
    { name: "Virement", value: report.transfer_total, color: "var(--color-chart-4)" },
  ].filter((p) => p.value > 0) : [];

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        title="États et impressions"
        description="Rapports X (intermédiaire) et Z (clôture)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-2xl">
        <Card className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={loadX}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileBarChart className="size-5" />
              Rapport X
            </CardTitle>
            <CardDescription>Rapport intermédiaire sans clôture</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={loadZ}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-5" />
              Rapport Z
            </CardTitle>
            <CardDescription>Rapport de clôture (fin de session)</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {loading && (
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      )}

      {!loading && report && (
        <div className="space-y-4 max-w-2xl">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {title}
                  <Badge variant="outline">{report.period_start.slice(0, 10)} → {report.period_end.slice(0, 10)}</Badge>
                </CardTitle>
              </div>
              <Button size="sm" onClick={() => { printReport(title); addToast("Impression lancée", "info"); }}>
                <Printer className="size-4" />
                Imprimer
              </Button>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={<TrendingUp className="size-4" />} label="Total TTC" value={fmtDinars(report.total_ttc)} unit="D" />
            <StatCard icon={<ShoppingBag className="size-4" />} label="Transactions" value={String(report.total_transactions)} />
            <StatCard icon={<Receipt className="size-4" />} label="Articles" value={String(report.total_quantity)} />
            <StatCard icon={<Banknote className="size-4" />} label="Espèces" value={fmtDinars(report.cash_total)} unit="D" />
            <StatCard icon={<CreditCard className="size-4" />} label="Carte" value={fmtDinars(report.card_total)} unit="D" />
            <StatCard icon={<FileText className="size-4" />} label="Chèque" value={fmtDinars(report.cheque_total)} unit="D" />
          </div>

          {paymentData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {paymentData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                      formatter={(value) => `${fmtDinars(Number(value))} D`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {paymentData.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs">
                      <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                      {p.name}: {fmtDinars(p.value)} D
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="tabular-nums">{fmtDinars(report.total_ht)} D</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TVA</span><span className="tabular-nums">{fmtDinars(report.total_tax)} D</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg"><span>Total TTC</span><span className="tabular-nums">{fmtDinars(report.total_ttc)} D</span></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          {icon}
          {label}
        </div>
        <div className="text-2xl font-bold tabular-nums">
          {value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-0.5">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
