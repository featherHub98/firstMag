import * as React from "react";
import {
  BarChart3,
  FileBarChart,
  Printer,
  TrendingUp,
  ShoppingBag,
  Receipt,
  CreditCard,
  FileText,
  Banknote,
} from "lucide-react";
import {
  fmtDinars,
  getBarcodeListing,
  getManagementDashboardReport,
  getSaleReportRange,
  getSettlementLedger,
  getStockMovementReport,
  getXReport,
  getZReport,
  listDocuments,
  listReportCatalog,
  printDocumentVariant,
  printReport,
} from "../api";
import { useToastStore } from "../api/toastStore";
import type {
  BarcodeReportRow,
  Document,
  ManagementDashboardReport,
  ReportCatalogItem,
  SaleReport,
  SettlementLedgerRow,
  StockMovementReportRow,
} from "../types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [report, setReport] = React.useState<SaleReport | null>(null);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [from, setFrom] = React.useState(monthStart);
  const [to, setTo] = React.useState(today);
  const [catalog, setCatalog] = React.useState<ReportCatalogItem[]>([]);
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [docTypeFilter, setDocTypeFilter] = React.useState("__all__");
  const [ledgerMode, setLedgerMode] = React.useState("__all__");
  const [ledgerRows, setLedgerRows] = React.useState<SettlementLedgerRow[]>([]);
  const [stockRows, setStockRows] = React.useState<StockMovementReportRow[]>([]);
  const [barcodeRows, setBarcodeRows] = React.useState<BarcodeReportRow[]>([]);
  const [dashboardReport, setDashboardReport] = React.useState<ManagementDashboardReport | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void loadCatalog();
    void loadDocuments();
    void loadSettlement();
    void loadStock();
    void loadDashboard();
  }, [from, to, docTypeFilter, ledgerMode]);

  async function loadCatalog() {
    try {
      setCatalog(await listReportCatalog());
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadDocuments() {
    try {
      setDocuments(await listDocuments(docTypeFilter === "__all__" ? undefined : docTypeFilter));
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadSettlement() {
    try {
      setLedgerRows(await getSettlementLedger(`${from}T00:00:00Z`, `${to}T23:59:59Z`, ledgerMode === "__all__" ? undefined : ledgerMode));
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadStock() {
    try {
      const [movements, barcodes] = await Promise.all([
        getStockMovementReport(`${from}T00:00:00Z`, `${to}T23:59:59Z`),
        getBarcodeListing(),
      ]);
      setStockRows(movements);
      setBarcodeRows(barcodes);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadDashboard() {
    try {
      setDashboardReport(await getManagementDashboardReport(`${from}T00:00:00Z`, `${to}T23:59:59Z`));
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadX() {
    setLoading(true);
    try {
      const r = await getXReport();
      setReport(r);
      setTitle("Rapport X");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadZ() {
    setLoading(true);
    try {
      const r = await getZReport();
      setReport(r);
      setTitle("Rapport Z");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadRangeReport() {
    setLoading(true);
    try {
      const r = await getSaleReportRange(`${from}T00:00:00Z`, `${to}T23:59:59Z`);
      setReport(r);
      setTitle("Rapport Periode");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  const paymentData = report
    ? [
        { name: "Especes", value: report.cash_total, color: "var(--color-chart-1)" },
        { name: "Carte", value: report.card_total, color: "var(--color-chart-2)" },
        { name: "Cheque", value: report.cheque_total, color: "var(--color-chart-3)" },
        { name: "Virement", value: report.transfer_total, color: "var(--color-chart-4)" },
      ].filter((p) => p.value > 0)
    : [];

  return (
    <div className="h-full overflow-y-auto space-y-4">
      <PageHeader title="Etats et analyses" description="Wave 5 - documents, reglements, stock, pilotage" />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Du</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Au</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" variant="outline" onClick={() => { void loadRangeReport(); void loadSettlement(); void loadStock(); void loadDashboard(); }}>
                Actualiser periode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue globale</TabsTrigger>
          <TabsTrigger value="catalog">Inventaire etats</TabsTrigger>
          <TabsTrigger value="documents">Impressions docs</TabsTrigger>
          <TabsTrigger value="settlement">Reglements</TabsTrigger>
          <TabsTrigger value="stock">Stock & codes</TabsTrigger>
          <TabsTrigger value="management">Pilotage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => void loadX()}>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileBarChart className="size-5" />Rapport X</CardTitle></CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => void loadZ()}>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="size-5" />Rapport Z</CardTitle></CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => void loadRangeReport()}>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-5" />Rapport periode</CardTitle></CardHeader>
            </Card>
          </div>

          {loading && (
            <div className="space-y-3 max-w-2xl">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
          )}

          {!loading && report && (
            <div className="space-y-4 max-w-3xl">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2">
                    {title}
                    <Badge variant="outline">{report.period_start.slice(0, 10)} to {report.period_end.slice(0, 10)}</Badge>
                  </CardTitle>
                  <Button size="sm" onClick={() => { void printReport(title); addToast("Impression lancee", "info"); }}>
                    <Printer className="size-4" /> Imprimer
                  </Button>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard icon={<TrendingUp className="size-4" />} label="Total TTC" value={fmtDinars(report.total_ttc)} unit="D" />
                <StatCard icon={<ShoppingBag className="size-4" />} label="Transactions" value={String(report.total_transactions)} />
                <StatCard icon={<Receipt className="size-4" />} label="Articles" value={String(report.total_quantity)} />
                <StatCard icon={<Banknote className="size-4" />} label="Especes" value={fmtDinars(report.cash_total)} unit="D" />
                <StatCard icon={<CreditCard className="size-4" />} label="Carte" value={fmtDinars(report.card_total)} unit="D" />
                <StatCard icon={<FileText className="size-4" />} label="Cheque" value={fmtDinars(report.cheque_total)} unit="D" />
              </div>

              {paymentData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Repartition paiements</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                          {paymentData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `${fmtDinars(Number(value))} D`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="catalog">
          <Card>
            <CardHeader><CardTitle>Inventaire des etats legacy</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {catalog.map((item) => (
                <div key={item.id} className="rounded border px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.legacy_label}</div>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Impression documents (vente/achat/retour/periodique)</CardTitle>
              <CardDescription>Selectionnez un document puis le format d'impression</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type document</Label>
                  <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous</SelectItem>
                      <SelectItem value="invoice">Facture vente</SelectItem>
                      <SelectItem value="credit_note">Retour vente</SelectItem>
                      <SelectItem value="purchase_invoice">Facture achat</SelectItem>
                      <SelectItem value="purchase_return">Retour achat</SelectItem>
                      <SelectItem value="order">Commande</SelectItem>
                      <SelectItem value="purchase_order">Commande achat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                {documents.slice(0, 80).map((d) => (
                  <div key={d.id} className="rounded border p-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{d.doc_number} - {d.partner_name}</div>
                      <div className="text-xs text-muted-foreground">{d.doc_type} | {new Date(d.created_at).toLocaleString("fr-FR")}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => void printDocumentVariant(d.id, "sales_document")}>Vente</Button>
                      <Button size="sm" variant="outline" onClick={() => void printDocumentVariant(d.id, "purchase_document")}>Achat</Button>
                      <Button size="sm" variant="outline" onClick={() => void printDocumentVariant(d.id, "return_document")}>Retour</Button>
                      <Button size="sm" variant="outline" onClick={() => void printDocumentVariant(d.id, "periodic_invoice")}>Periodique</Button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && <div className="text-sm text-muted-foreground">Aucun document.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement">
          <Card>
            <CardHeader><CardTitle>Journaux reglements (cheque/traite/paiements)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5 max-w-xs">
                <Label>Mode</Label>
                <Select value={ledgerMode} onValueChange={setLedgerMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous</SelectItem>
                    <SelectItem value="cash">Especes</SelectItem>
                    <SelectItem value="card">Carte</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="transfer">Virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-2 py-2">Date</th>
                      <th className="text-left px-2 py-2">Ticket</th>
                      <th className="text-left px-2 py-2">Mode</th>
                      <th className="text-left px-2 py-2">Reference</th>
                      <th className="text-right px-2 py-2">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerRows.map((r, idx) => (
                      <tr key={`${r.ticket_id}-${idx}`} className="border-t">
                        <td className="px-2 py-1">{new Date(r.created_at).toLocaleString("fr-FR")}</td>
                        <td className="px-2 py-1 font-mono">{r.ticket_id}</td>
                        <td className="px-2 py-1">{r.mode}</td>
                        <td className="px-2 py-1">{r.reference || "-"}</td>
                        <td className="px-2 py-1 text-right font-mono">{fmtDinars(r.amount)} D</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Mouvements stock</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left px-2 py-2">Date</th>
                        <th className="text-left px-2 py-2">Type</th>
                        <th className="text-left px-2 py-2">Article</th>
                        <th className="text-left px-2 py-2">Depot</th>
                        <th className="text-right px-2 py-2">Quantite</th>
                        <th className="text-left px-2 py-2">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockRows.slice(0, 300).map((r, idx) => (
                        <tr key={`${r.article_id}-${idx}`} className="border-t">
                          <td className="px-2 py-1">{new Date(r.created_at).toLocaleString("fr-FR")}</td>
                          <td className="px-2 py-1">{r.movement_type}</td>
                          <td className="px-2 py-1">{r.article_name}</td>
                          <td className="px-2 py-1">{r.depot_id}</td>
                          <td className="px-2 py-1 text-right font-mono">{fmtDinars(r.quantity)}</td>
                          <td className="px-2 py-1">{r.reference || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Listing codes-barres / PLU</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left px-2 py-2">Article</th>
                        <th className="text-left px-2 py-2">Code principal</th>
                        <th className="text-left px-2 py-2">Barcode</th>
                        <th className="text-left px-2 py-2">Code secondaire</th>
                        <th className="text-left px-2 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barcodeRows.slice(0, 500).map((r, idx) => (
                        <tr key={`${r.article_id}-${idx}`} className="border-t">
                          <td className="px-2 py-1">{r.article_name}</td>
                          <td className="px-2 py-1 font-mono">{r.article_code}</td>
                          <td className="px-2 py-1 font-mono">{r.barcode || "-"}</td>
                          <td className="px-2 py-1 font-mono">{r.alt_code || "-"}</td>
                          <td className="px-2 py-1">{r.alt_code_type || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <Card>
            <CardHeader><CardTitle>Dashboard pilotage / requetes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {dashboardReport ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={<ShoppingBag className="size-4" />} label="Stock net" value={fmtDinars(dashboardReport.stock_total_quantity)} />
                    <StatCard icon={<Banknote className="size-4" />} label="Cash in" value={fmtDinars(dashboardReport.cash_in_total)} unit="D" />
                    <StatCard icon={<Banknote className="size-4" />} label="Cash out" value={fmtDinars(dashboardReport.cash_out_total)} unit="D" />
                    <StatCard icon={<Receipt className="size-4" />} label="Jours analyses" value={String(dashboardReport.turnover_evolution.length)} />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded border p-3">
                      <h4 className="font-medium mb-2">Top clients</h4>
                      <div className="space-y-1">
                        {dashboardReport.top_clients.map((r) => (
                          <div key={r.partner_id} className="flex justify-between text-sm">
                            <span>{r.partner_name}</span>
                            <span className="font-mono">{fmtDinars(r.total_ttc)} D</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded border p-3">
                      <h4 className="font-medium mb-2">Top fournisseurs</h4>
                      <div className="space-y-1">
                        {dashboardReport.top_suppliers.map((r) => (
                          <div key={r.partner_id} className="flex justify-between text-sm">
                            <span>{r.partner_name}</span>
                            <span className="font-mono">{fmtDinars(r.total_ttc)} D</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune donnee.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
