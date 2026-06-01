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
import { getOpenSession, openSession, closeSession, fiscalConnect, fiscalDisconnect, fiscalCpx, fiscalCpm, fiscalCpb, fiscalRsx, fiscalRsz, fiscalRuz, fiscalReset, fmtDinars, dinarsToMillimes } from "../api";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";
import type { PosSession } from "../types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const DEFAULT_TAXES = [
  { name: "TVA 19%", rate: 19 },
  { name: "TVA 13%", rate: 13 },
  { name: "TVA 7%", rate: 7 },
  { name: "TVA 0%", rate: 0 },
];

const DEFAULT_SERIES = [
  { type: "Facture", prefix: "FACT-" },
  { type: "Devis", prefix: "DEV-" },
  { type: "Commande", prefix: "CMD-" },
  { type: "Bon de livraison", prefix: "BL-" },
];

export default function SettingsPage() {
  const setRegisterOpen = useSessionStore((s) => s.setRegisterOpen);
  const [session, setSession] = React.useState<PosSession | null>(null);
  const [fund, setFund] = React.useState("10.000");
  const [closingFund, setClosingFund] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const [company, setCompany] = React.useState({ name: "FIRST MAG", address: "", phone: "", tax_id: "" });
  const [fiscalPort, setFiscalPort] = React.useState("COM1");
  const [fiscalConnected, setFiscalConnected] = React.useState(false);
  const [fiscalStatus, setFiscalStatus] = React.useState("");

  React.useEffect(() => { checkSession(); }, []);

  async function checkSession() {
    try { const s = await getOpenSession(); setSession(s); setRegisterOpen(!!s, s?.id); }
    catch { /* no session */ }
  }

  async function handleOpen() {
    setLoading(true);
    try {
      const s = await openSession("1", dinarsToMillimes(parseFloat(fund) || 0));
      setSession(s); setRegisterOpen(true, s.id);
      addToast("Session ouverte", "success");
    } catch (e) { addToast(String(e), "error"); }
    setLoading(false);
  }

  async function handleClose() {
    if (!session) return;
    setLoading(true);
    try {
      const s = await closeSession(session.id, dinarsToMillimes(parseFloat(closingFund) || 0));
      setSession(s); setRegisterOpen(false);
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

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        title="Configuration"
        description="Gérez la caisse, la caisse fiscale, votre société et les séries de numérotation"
      />

      <Tabs defaultValue="register" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="register" className="gap-1.5"><Wallet className="size-4" />Caisse</TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-1.5"><FiscalIcon className="size-4" />Fiscale</TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5"><Building2 className="size-4" />Société</TabsTrigger>
          <TabsTrigger value="taxes" className="gap-1.5"><Percent className="size-4" />TVA</TabsTrigger>
          <TabsTrigger value="series" className="gap-1.5"><Hash className="size-4" />Séries</TabsTrigger>
        </TabsList>

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
              <Button onClick={() => addToast("Société enregistrée", "success")}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Taux de TVA</CardTitle>
              <CardDescription>Taux de taxe sur la valeur ajoutée configurés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DEFAULT_TAXES.map((t) => (
                  <div key={t.rate} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Percent className="size-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{t.name}</span>
                    <Badge variant="secondary" className="font-mono">{t.rate}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="series">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Séries de documents</CardTitle>
              <CardDescription>Préfixes et compteurs de numérotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DEFAULT_SERIES.map((s) => (
                  <div key={s.type} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Hash className="size-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{s.type}</span>
                    <Badge variant="secondary" className="font-mono">{s.prefix}000001</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
