import { useState, useCallback } from "react";
import { getXReport, getZReport, printReport, fmtDinars } from "../api";
import type { SaleReport } from "../types";

export default function ReportsPage() {
  const [report, setReport] = useState<SaleReport | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const loadX = useCallback(async () => {
    setLoading(true);
    try { const r = await getXReport(); setReport(r); setTitle("Rapport X"); }
    finally { setLoading(false); }
  }, []);

  const loadZ = useCallback(async () => {
    setLoading(true);
    try { const r = await getZReport(); setReport(r); setTitle("Rapport Z"); }
    finally { setLoading(false); }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">États et impressions</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <button onClick={loadX} disabled={loading}
          className="touch-button p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:shadow-md transition-shadow">
          <span className="font-medium">Rapport X</span>
          <span className="text-sm text-slate-500 block">Rapport intermédiaire caisse</span>
        </button>
        <button onClick={loadZ} disabled={loading}
          className="touch-button p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:shadow-md transition-shadow">
          <span className="font-medium">Rapport Z</span>
          <span className="text-sm text-slate-500 block">Rapport de clôture caisse</span>
        </button>
      </div>

      {report && (
        <div className="max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="flex gap-2">
              <button onClick={() => setReport(null)}
                className="touch-button px-3 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 text-sm font-medium">Fermer</button>
              <button onClick={() => printReport(title)}
                className="touch-button px-3 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold">Imprimer</button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-3 font-mono text-sm">
            <Row label="Période" value={`${report.period_start.slice(0, 10)} → ${report.period_end.slice(0, 10)}`} />
            <Row label="Transactions" value={report.total_transactions.toString()} />
            <Row label="Articles vendus" value={report.total_quantity.toString()} />
            <hr className="border-slate-300 dark:border-slate-500" />
            <Row label="Total HT" value={`${fmtDinars(report.total_ht)} D`} />
            <Row label="Total TVA" value={`${fmtDinars(report.total_tax)} D`} />
            <Row label="Total TTC" value={`${fmtDinars(report.total_ttc)} D`} bold />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={bold ? "font-bold text-blue-600" : ""}>{value}</span>
    </div>
  );
}
