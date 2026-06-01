import { useState } from "react";
import { searchArticles, getStockLevel, listStockMovements } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Article, StockMovement } from "../types";

export default function StockPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [view, setView] = useState<"levels" | "movements">("levels");
  const addToast = useToastStore((s) => s.addToast);

  async function loadArticles() {
    if (!q.trim()) { setArticles([]); return; }
    try {
      const data = await searchArticles(q.trim());
      setArticles(data);
      const lvls: Record<string, number> = {};
      for (const a of data) {
        try { const l = await getStockLevel(a.id); lvls[a.id] = l.quantity; } catch { lvls[a.id] = 0; }
      }
      setLevels(lvls);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function showMovements(articleId: string) {
    try {
      const data = await listStockMovements(articleId);
      setMovements(data);
      setView("movements");
    } catch (e) { addToast(String(e), "error"); }
  }

  const typeLabels: Record<string, string> = {
    entry: "Entrée", exit: "Sortie", transfer: "Transfert", inventory: "Inventaire",
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Gestion de stock</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setView("levels")}
          className={`touch-button px-4 h-10 rounded-lg border font-medium text-sm whitespace-nowrap ${view === "levels" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>Niveaux</button>
        <button onClick={() => { setView("movements"); listStockMovements().then(setMovements).catch(() => {}); }}
          className={`touch-button px-4 h-10 rounded-lg border font-medium text-sm whitespace-nowrap ${view === "movements" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>Mouvements</button>
      </div>

      {view === "levels" && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") loadArticles(); }}
              placeholder="Rechercher un article..."
              className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" />
            <button onClick={loadArticles} className="touch-button px-4 h-10 rounded-lg bg-blue-600 text-white font-medium">OK</button>
          </div>
          {articles.length === 0 && <p className="text-slate-400 text-center mt-8">Recherchez un article</p>}
          {articles.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-slate-500">{a.code}</p>
              </div>
              <span className="font-bold text-lg">{levels[a.id] ?? "?"}</span>
              <button onClick={() => showMovements(a.id)}
                className="touch-button px-3 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-medium">Mouvements</button>
            </div>
          ))}
        </div>
      )}

      {view === "movements" && (
        <div className="flex-1 overflow-y-auto">
          <button onClick={() => setView("levels")}
            className="touch-button text-blue-600 text-sm mb-3">&larr; Retour</button>
          {movements.length === 0 && <p className="text-slate-400 text-center mt-8">Aucun mouvement</p>}
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Date</th><th className="pb-2">Type</th><th className="pb-2">Article</th>
              <th className="pb-2 text-right">Qté</th><th className="pb-2">Réf.</th>
            </tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-2 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      m.movement_type === "entry" ? "bg-green-100 text-green-700" :
                      m.movement_type === "exit" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{typeLabels[m.movement_type] || m.movement_type}</span>
                  </td>
                  <td className="py-2">{m.article_id.slice(0, 8)}</td>
                  <td className="py-2 text-right font-bold">{m.quantity}</td>
                  <td className="py-2 text-slate-500">{m.reference || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
