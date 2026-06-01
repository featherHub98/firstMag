import { useState, useEffect } from "react";
import { getOpenSession, openSession, closeSession, fiscalConnect, fiscalDisconnect, fiscalCpx, fiscalCpm, fiscalCpb, fiscalRsx, fiscalRsz, fiscalRuz, fiscalReset } from "../api";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";
import type { PosSession } from "../types";

const DEFAULT_TAXES = [
  { name: "TVA 19%", rate: 19 },
  { name: "TVA 13%", rate: 13 },
  { name: "TVA 7%", rate: 7 },
  { name: "TVA 0%", rate: 0 },
];

const DEFAULT_SERIES = [
  { type: "invoice", prefix: "FACT-" },
  { type: "quote", prefix: "DEV-" },
  { type: "order", prefix: "CMD-" },
  { type: "delivery", prefix: "BL-" },
];

export default function SettingsPage() {
  const setRegisterOpen = useSessionStore((s) => s.setRegisterOpen);
  const [session, setSession] = useState<PosSession | null>(null);
  const [fund, setFund] = useState("10000");
  const [closingFund, setClosingFund] = useState("");
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const [company, setCompany] = useState({ name: "FIRST MAG", address: "", phone: "", tax_id: "" });
  const [activeTab, setActiveTab] = useState("register");

  useEffect(() => { checkSession(); }, []);

  async function checkSession() {
    try { const s = await getOpenSession(); setSession(s); setRegisterOpen(!!s, s?.id); }
    catch { /* no session */ }
  }

  async function handleOpen() {
    setLoading(true);
    try {
      const s = await openSession("1", parseInt(fund) || 0);
      setSession(s); setRegisterOpen(true, s.id);
      addToast("Session ouverte", "success");
    } catch (e) { addToast(String(e), "error"); }
    setLoading(false);
  }

  async function handleClose() {
    if (!session) return;
    setLoading(true);
    try {
      const s = await closeSession(session.id, parseInt(closingFund) || 0);
      setSession(s); setRegisterOpen(false);
      addToast("Session fermée", "success");
    } catch (e) { addToast(String(e), "error"); }
    setLoading(false);
  }

  const [fiscalPort, setFiscalPort] = useState("COM1");
  const [fiscalConnected, setFiscalConnected] = useState(false);
  const [fiscalStatus, setFiscalStatus] = useState("");

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

  const tabs = [
    { id: "register", label: "Caisse" },
    { id: "fiscal", label: "Fiscale" },
    { id: "company", label: "Société" },
    { id: "taxes", label: "TVA" },
    { id: "series", label: "Séries" },
  ];

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-4">Configuration</h1>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`touch-button px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeTab === t.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-lg space-y-4">
        {activeTab === "register" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg mb-3">Gestion de caisse</h2>
            {session?.status === "open" ? (
              <div>
                <p className="text-sm text-slate-500 mb-3">Session ouverte depuis {new Date(session.opened_at).toLocaleString()}</p>
                <p className="text-sm mb-2">Ticket #{session.ticket_count} &middot; Total {(session.total_sales / 1000).toFixed(3)} D</p>
                <input type="number" value={closingFund} onChange={(e) => setClosingFund(e.target.value)}
                  placeholder="Fonds de clôture (millimes)" className="w-full h-10 rounded-lg px-3 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
                <button onClick={handleClose} disabled={loading}
                  className="touch-button w-full h-12 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">
                  {loading ? "Fermeture..." : "Fermer la caisse"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500 mb-3">Caisse fermée</p>
                <input type="number" value={fund} onChange={(e) => setFund(e.target.value)}
                  placeholder="Fonds d'ouverture (millimes)" className="w-full h-10 rounded-lg px-3 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
                <button onClick={handleOpen} disabled={loading}
                  className="touch-button w-full h-12 rounded-xl bg-green-600 text-white font-bold disabled:opacity-50">
                  {loading ? "Ouverture..." : "Ouvrir la caisse"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "fiscal" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg mb-3">Caisse fiscale (QDRIVER)</h2>
            <div className="flex gap-2 mb-3">
              <input type="text" value={fiscalPort} onChange={(e) => setFiscalPort(e.target.value)}
                className="flex-1 h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
              {!fiscalConnected ? (
                <button onClick={handleFiscalConnect}
                  className="touch-button h-10 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm">Connecter</button>
              ) : (
                <button onClick={handleFiscalDisconnect}
                  className="touch-button h-10 px-4 rounded-lg bg-red-600 text-white font-medium text-sm">Déconnecter</button>
              )}
            </div>
            {fiscalStatus && <p className="text-xs text-slate-500 mb-2">{fiscalStatus}</p>}
            {fiscalConnected && (
              <div className="flex flex-wrap gap-2">
                <button onClick={handleFiscalTest}
                  className="touch-button h-9 px-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium">Test CPX→CPM→CPB</button>
                <button onClick={async () => { try { const r = await fiscalRsx(1); addToast(`RSX: ${r}`, "success"); } catch (e) { addToast(String(e), "error"); } }}
                  className="touch-button h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium">RSX</button>
                <button onClick={async () => { try { const r = await fiscalRsz(1); addToast(`RSZ: ${r}`, "success"); } catch (e) { addToast(String(e), "error"); } }}
                  className="touch-button h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium">RSZ</button>
                <button onClick={async () => { try { const r = await fiscalRuz(); addToast(`RUz: ${r}`, "success"); } catch (e) { addToast(String(e), "error"); } }}
                  className="touch-button h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium">RUz</button>
              <button onClick={async () => { try { await fiscalReset(); addToast("Reset OK", "success"); } catch (e) { addToast(String(e), "error"); } }}
                  className="touch-button h-9 px-3 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium">Reset</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "company" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg mb-3">Société</h2>
            <div className="space-y-3">
              <input type="text" value={company.name} onChange={(e) => setCompany(c => ({ ...c, name: e.target.value }))}
                placeholder="Raison sociale"
                className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
              <input type="text" value={company.address} onChange={(e) => setCompany(c => ({ ...c, address: e.target.value }))}
                placeholder="Adresse"
                className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
              <input type="text" value={company.phone} onChange={(e) => setCompany(c => ({ ...c, phone: e.target.value }))}
                placeholder="Téléphone"
                className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
              <input type="text" value={company.tax_id} onChange={(e) => setCompany(c => ({ ...c, tax_id: e.target.value }))}
                placeholder="Matricule fiscal"
                className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300" />
              <button onClick={() => addToast("Société enregistrée", "success")}
                className="touch-button w-full h-10 rounded-lg bg-blue-600 text-white font-medium">Enregistrer</button>
            </div>
          </div>
        )}

        {activeTab === "taxes" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg mb-3">Taux de TVA</h2>
            <div className="space-y-2">
              {DEFAULT_TAXES.map((t) => (
                <div key={t.rate} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                  <span className="flex-1 font-medium">{t.name}</span>
                  <span className="text-blue-600 font-bold">{t.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "series" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg mb-3">Séries de documents</h2>
            <div className="space-y-2">
              {DEFAULT_SERIES.map((s) => (
                <div key={s.type} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                  <span className="flex-1 font-medium capitalize">{s.type}</span>
                  <span className="text-blue-600 font-mono font-bold">{s.prefix}000001</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
