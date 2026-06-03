import * as React from "react";
import {
  Wallet,
  Receipt as FiscalIcon,
  Building2,
  Percent,
  Hash,
  Power,
  PowerOff,
  Printer,
  FileBarChart,
  RefreshCcw,
} from "lucide-react";
import {
  getOpenSession,
  openSession,
  closeSession,
  getSessionCashSummary,
  listSessionCashTotals,
  listCashiers,
  listRegisters,
  getAppSettings,
  setAppSettings,
  listDocumentSeries,
  updateDocumentSeries,
  fiscalConnect,
  fiscalDisconnect,
  fiscalCpx,
  fiscalCpm,
  fiscalCpb,
  fiscalRsx,
  fiscalRsz,
  fiscalRuz,
  fiscalReset,
  backupDatabase,
  restoreDatabaseFromBackup,
  verifyDatabaseHealth,
  uploadFiscalPlu,
  importExternalRegisterCsv,
  runSiteSyncNow,
  fmtDinars,
  dinarsToMillimes,
} from "../api";
import { useSessionStore } from "../stores/sessionStore";
import { useUiStore } from "../stores/uiStore";
import { useToastStore } from "../api/toastStore";
import type {
  Cashier,
  CashMovementSummary,
  CashSessionTotals,
  DocumentSeries,
  PosSession,
  Register,
} from "../types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RayonManagement from "@/components/common/RayonManagement";
import GondolaManagement from "@/components/common/GondolaManagement";
import ProductRangeManagement from "@/components/common/ProductRangeManagement";
import TariffCategoryManagement from "@/components/common/TariffCategoryManagement";
import AccountingCategoryManagement from "@/components/common/AccountingCategoryManagement";
import AdvancedTaxRateManagement from "@/components/common/AdvancedTaxRateManagement";
import RolePermissionManagement from "@/components/common/RolePermissionManagement";
import CountryManagement from "@/components/common/CountryManagement";
import FamilyManagement from "@/components/common/FamilyManagement";
import UnitOfMeasureManagement from "@/components/common/UnitOfMeasureManagement";
import DepotManagement from "@/components/common/DepotManagement";
import BankManagement from "@/components/common/BankManagement";
import CurrencyManagement from "@/components/common/CurrencyManagement";
import PaymentMethodManagement from "@/components/common/PaymentMethodManagement";
import SalespersonManagement from "@/components/common/SalespersonManagement";

export default function SettingsPage() {
  const setRegisterOpen = useSessionStore((s) => s.setRegisterOpen);
  const keyboardProfile = useUiStore((s) => s.keyboardProfile);
  const scannerFirstFocus = useUiStore((s) => s.scannerFirstFocus);
  const density = useUiStore((s) => s.density);
  const toggleKeyboardProfile = useUiStore((s) => s.toggleKeyboardProfile);
  const toggleScannerFirstFocus = useUiStore((s) => s.toggleScannerFirstFocus);
  const setDensity = useUiStore((s) => s.setDensity);
  const [session, setSession] = React.useState<PosSession | null>(null);
  const [cashSummary, setCashSummary] = React.useState<CashMovementSummary | null>(null);
  const [sessionTotals, setSessionTotals] = React.useState<CashSessionTotals[]>([]);
  const [reportFrom, setReportFrom] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [fund, setFund] = React.useState("10.000");
  const [closingFund, setClosingFund] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [cashiers, setCashiers] = React.useState<Cashier[]>([]);
  const [registers, setRegisters] = React.useState<Register[]>([]);
  const [selectedCashierId, setSelectedCashierId] = React.useState("1");
  const [selectedRegisterId, setSelectedRegisterId] = React.useState("1");
  const [series, setSeries] = React.useState<DocumentSeries[]>([]);
  const [savingCompany, setSavingCompany] = React.useState(false);
  const [savingSeries, setSavingSeries] = React.useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const [company, setCompany] = React.useState({ name: "FIRST MAG", address: "", phone: "", tax_id: "" });
  const [fiscalPort, setFiscalPort] = React.useState("COM1");
  const [fiscalConnected, setFiscalConnected] = React.useState(false);
  const [fiscalStatus, setFiscalStatus] = React.useState("");
  const [hardware, setHardware] = React.useState({
    scanner_port: "",
    customer_display_port: "",
    cash_drawer_port: "",
    receipt_printer: "",
    cheque_printer: "",
    kitchen_printer: "",
    touch_mode: "false",
  });
  const [labelConfig, setLabelConfig] = React.useState({
    label_protocol: "INTART",
    label_template: "A4-3x8",
    label_dpi: "203",
  });
  const [syncConfig, setSyncConfig] = React.useState({
    endpoint: "",
    interval_minutes: "30",
    last_run_at: "",
  });
  const [backupPath, setBackupPath] = React.useState("C:/Users/PC/Desktop/firstmag_backup.db");
  const [restorePath, setRestorePath] = React.useState("C:/Users/PC/Desktop/firstmag_backup.db");
  const [dbHealth, setDbHealth] = React.useState<{ quick: string; integrity: string; ok: boolean } | null>(null);
  const [pluSource, setPluSource] = React.useState("manual");
  const [pluCsvPath, setPluCsvPath] = React.useState("C:/Users/PC/Desktop/plu_upload.csv");
  const [importCsvPath, setImportCsvPath] = React.useState("C:/Users/PC/Desktop/external_articles.csv");
  const [importStrategy, setImportStrategy] = React.useState<"upsert" | "insert_only" | "update_only">("upsert");
  const [verticals, setVerticals] = React.useState({
    vertical_restaurant: "false",
    vertical_fuel: "false",
    vertical_customs: "false",
    vertical_medical: "false",
    vertical_budget: "false",
    vertical_sms: "false",
  });

  React.useEffect(() => {
    checkSession();
    void loadPosReferences();
    void loadConfiguration();
  }, []);
  React.useEffect(() => { void loadSessionTotals(); }, [reportFrom, reportTo]);

  async function checkSession() {
    try {
      const s = await getOpenSession();
      setSession(s);
      setRegisterOpen(!!s, s?.id, s?.opening_fund ?? 0);
      if (s?.status === "open") {
        try { setCashSummary(await getSessionCashSummary(s.id)); } catch { setCashSummary(null); }
      } else {
        setCashSummary(null);
      }
    }
    catch { /* no session */ }
  }

  async function loadSessionTotals() {
    try {
      const rows = await listSessionCashTotals(reportFrom, reportTo);
      setSessionTotals(rows);
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadPosReferences() {
    try {
      const [cashierRows, registerRows] = await Promise.all([listCashiers(), listRegisters()]);
      const activeCashiers = cashierRows.filter((c) => c.active);
      const activeRegisters = registerRows.filter((r) => r.active);
      setCashiers(activeCashiers);
      setRegisters(activeRegisters);
      if (activeCashiers.length > 0 && !activeCashiers.some((c) => c.id === selectedCashierId)) {
        setSelectedCashierId(activeCashiers[0].id);
      }
      if (activeRegisters.length > 0 && !activeRegisters.some((r) => r.id === selectedRegisterId)) {
        setSelectedRegisterId(activeRegisters[0].id);
      }
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function loadConfiguration() {
    try {
      const [settings, rows] = await Promise.all([
        getAppSettings([
          "company_name", "company_address", "company_phone", "company_tax_id",
          "hw_scanner_port", "hw_customer_display_port", "hw_cash_drawer_port",
          "hw_receipt_printer", "hw_cheque_printer", "hw_kitchen_printer", "hw_touch_mode",
          "label_protocol", "label_template", "label_dpi",
          "sync_endpoint", "sync_interval_minutes", "sync_last_run_at",
          "vertical_restaurant", "vertical_fuel", "vertical_customs",
          "vertical_medical", "vertical_budget", "vertical_sms",
          "fiscal_plu_source",
        ]),
        listDocumentSeries(),
      ]);
      setCompany({
        name: settings.company_name || "FIRST MAG",
        address: settings.company_address || "",
        phone: settings.company_phone || "",
        tax_id: settings.company_tax_id || "",
      });
      setSeries(rows);
      setHardware({
        scanner_port: settings.hw_scanner_port || "",
        customer_display_port: settings.hw_customer_display_port || "",
        cash_drawer_port: settings.hw_cash_drawer_port || "",
        receipt_printer: settings.hw_receipt_printer || "",
        cheque_printer: settings.hw_cheque_printer || "",
        kitchen_printer: settings.hw_kitchen_printer || "",
        touch_mode: settings.hw_touch_mode || "false",
      });
      setLabelConfig({
        label_protocol: settings.label_protocol || "INTART",
        label_template: settings.label_template || "A4-3x8",
        label_dpi: settings.label_dpi || "203",
      });
      setSyncConfig({
        endpoint: settings.sync_endpoint || "",
        interval_minutes: settings.sync_interval_minutes || "30",
        last_run_at: settings.sync_last_run_at || "",
      });
      setVerticals({
        vertical_restaurant: settings.vertical_restaurant || "false",
        vertical_fuel: settings.vertical_fuel || "false",
        vertical_customs: settings.vertical_customs || "false",
        vertical_medical: settings.vertical_medical || "false",
        vertical_budget: settings.vertical_budget || "false",
        vertical_sms: settings.vertical_sms || "false",
      });
      setPluSource(settings.fiscal_plu_source || "manual");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleSaveCompany() {
    setSavingCompany(true);
    try {
      await setAppSettings({
        company_name: company.name,
        company_address: company.address,
        company_phone: company.phone,
        company_tax_id: company.tax_id,
      });
      addToast("Societe enregistree", "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleSaveSeries() {
    setSavingSeries(true);
    try {
      await Promise.all(
        series.map((row) =>
          updateDocumentSeries({
            id: row.id,
            prefix: row.prefix,
            next_number: row.next_number,
            format: row.format,
          }),
        ),
      );
      addToast("Series enregistrees", "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSavingSeries(false);
    }
  }

  async function handleOpen() {
    if (!selectedCashierId) {
      addToast("Choisissez un caissier", "error");
      return;
    }
    if (!selectedRegisterId) {
      addToast("Choisissez une caisse", "error");
      return;
    }
    setLoading(true);
    try {
      const s = await openSession(
        selectedCashierId,
        dinarsToMillimes(parseFloat(fund) || 0),
        selectedRegisterId,
      );
      setSession(s); setRegisterOpen(true, s.id, s.opening_fund);
      try { setCashSummary(await getSessionCashSummary(s.id)); } catch { setCashSummary(null); }
      await loadSessionTotals();
      addToast("Session ouverte", "success");
    } catch (e) { addToast(String(e), "error"); }
    setLoading(false);
  }

  async function handleClose() {
    if (!session) return;
    setLoading(true);
    try {
      const s = await closeSession(session.id, dinarsToMillimes(parseFloat(closingFund) || 0));
      setSession(s); setRegisterOpen(false, undefined, 0);
      setCashSummary(null);
      await loadSessionTotals();
      addToast("Session fermée", "success");
    } catch (e) { addToast(String(e), "error"); }
    setLoading(false);
  }

  async function handleFiscalConnect() {
    try {
      const msg = await fiscalConnect(fiscalPort);
      setFiscalConnected(true); setFiscalStatus(msg);
      addToast(msg, "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleFiscalDisconnect() {
    try { await fiscalDisconnect(); setFiscalConnected(false); setFiscalStatus(""); addToast("Déconnecté", "success"); }
    catch (e) { addToast(String(e), "error"); }
  }

  async function handleFiscalTest() {
    try {
      const r = await fiscalCpx("1", "Client test");
      const r2 = await fiscalCpm(1000, "cash");
      const r3 = await fiscalCpb();
      setFiscalStatus(`CPX: ${r} / CPM: ${r2} / CPB: ${r3}`);
      addToast("Test fiscal OK", "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleSaveHardware() {
    try {
      await setAppSettings({
        hw_scanner_port: hardware.scanner_port,
        hw_customer_display_port: hardware.customer_display_port,
        hw_cash_drawer_port: hardware.cash_drawer_port,
        hw_receipt_printer: hardware.receipt_printer,
        hw_cheque_printer: hardware.cheque_printer,
        hw_kitchen_printer: hardware.kitchen_printer,
        hw_touch_mode: hardware.touch_mode,
      });
      addToast("Configuration hardware enregistree", "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleSaveLabelProtocol() {
    try {
      await setAppSettings({
        label_protocol: labelConfig.label_protocol,
        label_template: labelConfig.label_template,
        label_dpi: labelConfig.label_dpi,
      });
      addToast("Configuration etiquettes enregistree", "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleBackupDatabase() {
    try {
      const result = await backupDatabase(backupPath);
      addToast(`Backup OK (${result.bytes} bytes)`, "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleRestoreDatabase() {
    try {
      const result = await restoreDatabaseFromBackup(restorePath);
      addToast(`Restauration OK (${result.copied_tables} tables)`, "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleVerifyDb() {
    try {
      const res = await verifyDatabaseHealth();
      setDbHealth({ quick: res.quick_check, integrity: res.integrity_check, ok: res.ok });
      addToast(res.ok ? "Verification DB OK" : "Verification DB avec alertes", res.ok ? "success" : "warning");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleSaveSync() {
    try {
      await setAppSettings({
        sync_endpoint: syncConfig.endpoint,
        sync_interval_minutes: syncConfig.interval_minutes,
      });
      addToast("Planification sync enregistree", "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleRunSync() {
    try {
      const result = await runSiteSyncNow(syncConfig.endpoint);
      setSyncConfig((prev) => ({ ...prev, last_run_at: result.started_at }));
      addToast(`Sync OK vers ${result.endpoint}`, "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleUploadPlu() {
    try {
      const result = await uploadFiscalPlu({
        source: pluSource,
        items: [],
      });
      await setAppSettings({
        fiscal_plu_source: pluSource,
        fiscal_plu_last_count: String(result.accepted_count),
        fiscal_plu_last_at: result.uploaded_at,
      });
      addToast(`PLU upload prepare (${result.accepted_count} lignes)`, "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleExternalImport() {
    try {
      const result = await importExternalRegisterCsv({
        path: importCsvPath,
        strategy: importStrategy,
      });
      addToast(
        `Import termine I:${result.inserted} U:${result.updated} S:${result.skipped} E:${result.failed}`,
        "success",
      );
    } catch (e) { addToast(String(e), "error"); }
  }

  async function handleSaveVerticalFlags() {
    try {
      await setAppSettings(verticals);
      addToast("Flags verticales enregistres", "success");
    } catch (e) { addToast(String(e), "error"); }
  }

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        title="Configuration"
        description="Gérez la caisse, la caisse fiscale, votre société et les séries de numérotation"
      />

      <Tabs defaultValue="register" className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-1">
          <TabsTrigger value="register" className="gap-1.5"><Wallet className="size-4" />Caisse</TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-1.5"><FiscalIcon className="size-4" />Fiscale</TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5"><Building2 className="size-4" />Société</TabsTrigger>
          <TabsTrigger value="taxes" className="gap-1.5"><Percent className="size-4" />TVA</TabsTrigger>
          <TabsTrigger value="series" className="gap-1.5"><Hash className="size-4" />Séries</TabsTrigger>
          <TabsTrigger value="families" className="gap-1.5">Familles</TabsTrigger>
          <TabsTrigger value="units" className="gap-1.5">Unites</TabsTrigger>
          <TabsTrigger value="depots" className="gap-1.5">Magasins</TabsTrigger>
          <TabsTrigger value="salespersons" className="gap-1.5">Vendeurs</TabsTrigger>
          <TabsTrigger value="currencies" className="gap-1.5">Devises</TabsTrigger>
          <TabsTrigger value="banks" className="gap-1.5">Banques</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5">Reglements</TabsTrigger>
          <TabsTrigger value="ranges" className="gap-1.5">Gammes</TabsTrigger>
          <TabsTrigger value="tariffs" className="gap-1.5">Tarifs</TabsTrigger>
          <TabsTrigger value="accounting" className="gap-1.5">Compta</TabsTrigger>
          <TabsTrigger value="rayons" className="gap-1.5">Rayons</TabsTrigger>
          <TabsTrigger value="gondoles" className="gap-1.5">Gondoles</TabsTrigger>
          <TabsTrigger value="countries" className="gap-1.5">Pays</TabsTrigger>
          <TabsTrigger value="auth" className="gap-1.5">Roles</TabsTrigger>
          <TabsTrigger value="hardware" className="gap-1.5">Hardware</TabsTrigger>
          <TabsTrigger value="fiscal_plus" className="gap-1.5">Fiscal+</TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5">Maintenance</TabsTrigger>
          <TabsTrigger value="integration" className="gap-1.5">Import/Sync</TabsTrigger>
          <TabsTrigger value="verticals" className="gap-1.5">Verticals</TabsTrigger>
          <TabsTrigger value="experience" className="gap-1.5">Ergonomie</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="register">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Gestion de caisse
                {session?.status === "open" ? (
                  <Badge variant="success">Ouverte</Badge>
                ) : (
                  <Badge variant="secondary">Fermée</Badge>
                )}
              </CardTitle>
              <CardDescription>Ouvrez ou fermez la session de caisse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session?.status === "open" ? (
                <>
                  <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Ouverte depuis:</span> {new Date(session.opened_at).toLocaleString("fr-FR")}</p>
                    <p><span className="text-muted-foreground">Tickets:</span> {session.ticket_count}</p>
                    <p><span className="text-muted-foreground">Total ventes:</span> {fmtDinars(session.total_sales)} D</p>
                    {cashSummary && (
                      <>
                        <p><span className="text-muted-foreground">Entrees caisse:</span> {fmtDinars(cashSummary.total_in)} D</p>
                        <p><span className="text-muted-foreground">Sorties caisse:</span> {fmtDinars(cashSummary.total_out)} D</p>
                        <p><span className="text-muted-foreground">Solde theorique:</span> {fmtDinars(cashSummary.current_cash)} D</p>
                      </>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="closingFund">Fonds de clôture (D)</Label>
                    <Input
                      id="closingFund"
                      type="number"
                      step="0.001"
                      value={closingFund}
                      onChange={(e) => setClosingFund(e.target.value)}
                      placeholder="0.000"
                    />
                  </div>
                  <Button onClick={handleClose} disabled={loading} variant="destructive" className="w-full">
                    <PowerOff className="size-4" />
                    {loading ? "Fermeture..." : "Fermer la caisse"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="registerSelect">Caisse</Label>
                      <select
                        id="registerSelect"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={selectedRegisterId}
                        onChange={(e) => setSelectedRegisterId(e.target.value)}
                      >
                        {registers.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.code} - {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cashierSelect">Caissier</Label>
                      <select
                        id="cashierSelect"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={selectedCashierId}
                        onChange={(e) => setSelectedCashierId(e.target.value)}
                      >
                        {cashiers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fund">Fonds d'ouverture (D)</Label>
                    <Input
                      id="fund"
                      type="number"
                      step="0.001"
                      value={fund}
                      onChange={(e) => setFund(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleOpen} disabled={loading} className="w-full">
                    <Power className="size-4" />
                    {loading ? "Ouverture..." : "Ouvrir la caisse"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Caisse fiscale (QDRIVER)
                {fiscalConnected ? <Badge variant="success">Connectée</Badge> : <Badge variant="secondary">Déconnectée</Badge>}
              </CardTitle>
              <CardDescription>Connexion au périphérique fiscal via port série</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="port">Port série</Label>
                  <Input id="port" value={fiscalPort} onChange={(e) => setFiscalPort(e.target.value)} placeholder="COM1" />
                </div>
                <div className="flex items-end">
                  {fiscalConnected ? (
                    <Button onClick={handleFiscalDisconnect} variant="destructive">
                      <PowerOff className="size-4" />
                      Déconnecter
                    </Button>
                  ) : (
                    <Button onClick={handleFiscalConnect}>
                      <Power className="size-4" />
                      Connecter
                    </Button>
                  )}
                </div>
              </div>
              {fiscalStatus && (
                <div className="rounded-lg bg-muted p-3 text-xs font-mono">{fiscalStatus}</div>
              )}
              {fiscalConnected && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Commandes</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={handleFiscalTest}>
                        <FileBarChart className="size-3.5" />
                        Test CPX→CPM→CPB
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => { try { const r = await fiscalRsx(1); addToast(`RSX: ${r}`, "success"); } catch (e) { addToast(String(e), "error"); } }}>
                        <Printer className="size-3.5" /> RSX
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => { try { const r = await fiscalRsz(1); addToast(`RSZ: ${r}`, "success"); } catch (e) { addToast(String(e), "error"); } }}>
                        <FileBarChart className="size-3.5" /> RSZ
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => { try { const r = await fiscalRuz(); addToast(`RUz: ${r}`, "success"); } catch (e) { addToast(String(e), "error"); } }}>
                        <Printer className="size-3.5" /> RUz
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => { try { await fiscalReset(); addToast("Reset OK", "success"); } catch (e) { addToast(String(e), "error"); } }}>
                        <RefreshCcw className="size-3.5" /> Reset
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Informations société</CardTitle>
              <CardDescription>Renseignez les informations de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cname">Raison sociale</Label>
                <Input id="cname" value={company.name} onChange={(e) => setCompany(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="caddress">Adresse</Label>
                <Input id="caddress" value={company.address} onChange={(e) => setCompany(c => ({ ...c, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cphone">Téléphone</Label>
                  <Input id="cphone" value={company.phone} onChange={(e) => setCompany(c => ({ ...c, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ctax">Matricule fiscal</Label>
                  <Input id="ctax" value={company.tax_id} onChange={(e) => setCompany(c => ({ ...c, tax_id: e.target.value }))} />
                </div>
              </div>
              <Button onClick={() => void handleSaveCompany()} disabled={savingCompany}>
                {savingCompany ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <AdvancedTaxRateManagement />
        </TabsContent>

        <TabsContent value="series">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Séries de documents</CardTitle>
              <CardDescription>Préfixes et compteurs de numérotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {series.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <Hash className="size-4 text-muted-foreground" />
                      <span className="flex-1 font-medium">{s.doc_type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Préfixe</Label>
                        <Input
                          value={s.prefix}
                          onChange={(e) =>
                            setSeries((prev) =>
                              prev.map((row) => (row.id === s.id ? { ...row, prefix: e.target.value } : row)),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Prochain numéro</Label>
                        <Input
                          type="number"
                          min={1}
                          value={s.next_number}
                          onChange={(e) =>
                            setSeries((prev) =>
                              prev.map((row) =>
                                row.id === s.id ? { ...row, next_number: parseInt(e.target.value || "1", 10) } : row,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={() => void handleSaveSeries()} disabled={savingSeries}>
                  {savingSeries ? "Enregistrement..." : "Enregistrer les séries"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="families">
          <FamilyManagement />
        </TabsContent>

        <TabsContent value="units">
          <UnitOfMeasureManagement />
        </TabsContent>

        <TabsContent value="depots">
          <DepotManagement />
        </TabsContent>

        <TabsContent value="salespersons">
          <SalespersonManagement />
        </TabsContent>

        <TabsContent value="currencies">
          <CurrencyManagement />
        </TabsContent>

        <TabsContent value="banks">
          <BankManagement />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentMethodManagement />
        </TabsContent>

        <TabsContent value="ranges">
          <ProductRangeManagement />
        </TabsContent>

        <TabsContent value="tariffs">
          <TariffCategoryManagement />
        </TabsContent>

        <TabsContent value="accounting">
          <AccountingCategoryManagement />
        </TabsContent>

        <TabsContent value="rayons">
          <RayonManagement />
        </TabsContent>

        <TabsContent value="gondoles">
          <GondolaManagement />
        </TabsContent>

        <TabsContent value="countries">
          <CountryManagement />
        </TabsContent>

        <TabsContent value="auth">
          <RolePermissionManagement />
        </TabsContent>

        <TabsContent value="hardware">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Configuration hardware</CardTitle>
              <CardDescription>Scanner, afficheur client, tiroir-caisse, imprimantes, mode tactile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Port scanner</Label>
                  <Input value={hardware.scanner_port} onChange={(e) => setHardware((h) => ({ ...h, scanner_port: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Port afficheur client</Label>
                  <Input value={hardware.customer_display_port} onChange={(e) => setHardware((h) => ({ ...h, customer_display_port: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Port tiroir-caisse</Label>
                  <Input value={hardware.cash_drawer_port} onChange={(e) => setHardware((h) => ({ ...h, cash_drawer_port: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Imprimante ticket</Label>
                  <Input value={hardware.receipt_printer} onChange={(e) => setHardware((h) => ({ ...h, receipt_printer: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Imprimante cheque</Label>
                  <Input value={hardware.cheque_printer} onChange={(e) => setHardware((h) => ({ ...h, cheque_printer: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Imprimante cuisine</Label>
                  <Input value={hardware.kitchen_printer} onChange={(e) => setHardware((h) => ({ ...h, kitchen_printer: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={hardware.touch_mode === "true"}
                  onCheckedChange={(checked) => setHardware((h) => ({ ...h, touch_mode: checked ? "true" : "false" }))}
                />
                <span className="text-sm">Mode tactile</span>
              </div>
              <Button onClick={() => void handleSaveHardware()}>Enregistrer hardware</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal_plus">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Fiscal integration + PLU upload</CardTitle>
              <CardDescription>X/Z deja disponible, configuration PLU upload ajoutee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Source PLU</Label>
                  <Input value={pluSource} onChange={(e) => setPluSource(e.target.value)} placeholder="manual | csv | erp" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fichier PLU (optionnel)</Label>
                  <Input value={pluCsvPath} onChange={(e) => setPluCsvPath(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Protocole etiquettes</Label>
                  <Input value={labelConfig.label_protocol} onChange={(e) => setLabelConfig((c) => ({ ...c, label_protocol: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Template etiquettes</Label>
                  <Input value={labelConfig.label_template} onChange={(e) => setLabelConfig((c) => ({ ...c, label_template: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>DPI</Label>
                  <Input value={labelConfig.label_dpi} onChange={(e) => setLabelConfig((c) => ({ ...c, label_dpi: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void handleSaveLabelProtocol()}>Enregistrer protocole etiquettes</Button>
                <Button onClick={() => void handleUploadPlu()}>Uploader PLU</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Backup / restore / DB verification</CardTitle>
              <CardDescription>Outils maintenance et reprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Chemin backup</Label>
                  <Input value={backupPath} onChange={(e) => setBackupPath(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => void handleBackupDatabase()} className="w-full">Lancer backup</Button>
                </div>
                <div className="space-y-1.5">
                  <Label>Chemin restore</Label>
                  <Input value={restorePath} onChange={(e) => setRestorePath(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={() => void handleRestoreDatabase()} className="w-full">Restaurer</Button>
                </div>
              </div>
              <Button variant="secondary" onClick={() => void handleVerifyDb()}>Verifier DB</Button>
              {dbHealth && (
                <div className="rounded border p-3 text-sm">
                  <div>quick_check: {dbHealth.quick}</div>
                  <div>integrity_check: {dbHealth.integrity}</div>
                  <div>status: {dbHealth.ok ? "OK" : "ALERT"}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>External import + site sync</CardTitle>
              <CardDescription>Import articles caisse externe et communication planifiee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>CSV externe articles</Label>
                  <Input value={importCsvPath} onChange={(e) => setImportCsvPath(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Strategie merge</Label>
                  <Select value={importStrategy} onValueChange={(v) => setImportStrategy(v as typeof importStrategy)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upsert">upsert</SelectItem>
                      <SelectItem value="insert_only">insert_only</SelectItem>
                      <SelectItem value="update_only">update_only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => void handleExternalImport()}>Importer et merger</Button>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Endpoint sync</Label>
                  <Input value={syncConfig.endpoint} onChange={(e) => setSyncConfig((c) => ({ ...c, endpoint: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Intervalle (minutes)</Label>
                  <Input value={syncConfig.interval_minutes} onChange={(e) => setSyncConfig((c) => ({ ...c, interval_minutes: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void handleSaveSync()}>Enregistrer planification</Button>
                <Button onClick={() => void handleRunSync()}>Lancer sync maintenant</Button>
              </div>
              {syncConfig.last_run_at && <p className="text-xs text-muted-foreground">Dernier run: {syncConfig.last_run_at}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verticals">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Optional vertical modules (feature flags)</CardTitle>
              <CardDescription>Restaurant/salon, fuel, customs, medical, budget, SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["vertical_restaurant", "Restaurant / Salon"],
                ["vertical_fuel", "Fuel / Pump"],
                ["vertical_customs", "Customs"],
                ["vertical_medical", "Medical / Occupational"],
                ["vertical_budget", "Budget"],
                ["vertical_sms", "SMS Notifications"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded border p-2">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={verticals[key as keyof typeof verticals] === "true"}
                    onCheckedChange={(checked) =>
                      setVerticals((v) => ({ ...v, [key]: checked ? "true" : "false" }))
                    }
                  />
                </div>
              ))}
              <Button onClick={() => void handleSaveVerticalFlags()}>Enregistrer flags</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Ergonomie operateur</CardTitle>
              <CardDescription>
                Reglages clavier et densite pour conserver les habitudes de travail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Nomenclature legacy active</p>
                  <p className="text-xs text-muted-foreground">Affiche les noms historiques dans navigation et en-tÃªtes.</p>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Profil clavier</p>
                  <p className="text-xs text-muted-foreground">Active F1..F9 et le comportement Escape global.</p>
                </div>
                <Switch checked={keyboardProfile} onCheckedChange={toggleKeyboardProfile} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Scanner-first focus</p>
                  <p className="text-xs text-muted-foreground">Repositionne rapidement le focus sur les champs de scan.</p>
                </div>
                <Switch checked={scannerFirstFocus} onCheckedChange={toggleScannerFirstFocus} />
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium mb-2">DensitÃ© d'interface</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={density === "modern" ? "default" : "outline"}
                    onClick={() => setDensity("modern")}
                  >
                    Moderne
                  </Button>
                  <Button
                    type="button"
                    variant={density === "classic" ? "default" : "outline"}
                    onClick={() => setDensity("classic")}
                  >
                    Classique
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="max-w-5xl mt-4">
            <CardHeader>
              <CardTitle>Historique des sessions</CardTitle>
              <CardDescription>Totaux caisse par session, caissier et periode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reportFrom">Du</Label>
                  <Input id="reportFrom" type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reportTo">Au</Label>
                  <Input id="reportTo" type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => void loadSessionTotals()} className="w-full">
                    Actualiser
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Ouverture</th>
                      <th className="px-3 py-2 font-medium">Caissier</th>
                      <th className="px-3 py-2 font-medium">Ouverture</th>
                      <th className="px-3 py-2 font-medium">Entrees</th>
                      <th className="px-3 py-2 font-medium">Sorties</th>
                      <th className="px-3 py-2 font-medium">Theo</th>
                      <th className="px-3 py-2 font-medium">Cloture</th>
                      <th className="px-3 py-2 font-medium">Ecart</th>
                      <th className="px-3 py-2 font-medium">Etat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionTotals.map((row) => (
                      <tr key={row.session_id} className="border-t">
                        <td className="px-3 py-2">{new Date(row.opened_at).toLocaleString("fr-FR")}</td>
                        <td className="px-3 py-2 font-mono">{row.cashier_id}</td>
                        <td className="px-3 py-2 font-mono">{fmtDinars(row.opening_fund)} D</td>
                        <td className="px-3 py-2 font-mono">{fmtDinars(row.total_in)} D</td>
                        <td className="px-3 py-2 font-mono">{fmtDinars(row.total_out)} D</td>
                        <td className="px-3 py-2 font-mono">{fmtDinars(row.theoretical_closing)} D</td>
                        <td className="px-3 py-2 font-mono">{row.closing_fund !== null ? `${fmtDinars(row.closing_fund)} D` : "-"}</td>
                        <td className={row.variance === 0 ? "px-3 py-2 font-mono text-emerald-600" : "px-3 py-2 font-mono text-amber-600"}>
                          {fmtDinars(row.variance)} D
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={row.status === "open" ? "success" : "secondary"}>{row.status === "open" ? "Ouverte" : "Fermee"}</Badge>
                        </td>
                      </tr>
                    ))}
                    {sessionTotals.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-muted-foreground" colSpan={9}>
                          Aucune session sur la periode selectionnee.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
