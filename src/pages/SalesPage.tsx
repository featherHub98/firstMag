import { useState, useEffect } from "react";
import { listDocuments, getDocumentLines, transformDocument, confirmDocument, printInvoice } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Document, DocumentLine } from "../types";

const tabs = [
  { key: "", label: "Tous" },
  { key: "quote", label: "Devis" },
  { key: "order", label: "Commandes" },
  { key: "delivery", label: "Livraisons" },
  { key: "invoice", label: "Factures" },
  { key: "credit_note", label: "Avoirs" },
];

export default function SalesPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Document | null>(null);
  const [lines, setLines] = useState<DocumentLine[]>([]);
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    const data = await listDocuments(filter || undefined);
    setDocs(data);
    setLoading(false);
  }

  async function openDoc(d: Document) {
    setSelected(d);
    const l = await getDocumentLines(d.id);
    setLines(l);
  }

  async function handleTransform(id: string) {
    try {
      const newDoc = await transformDocument(id);
      addToast(`Document transformé: ${newDoc.doc_number}`, "success");
      setSelected(null);
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleConfirm(id: string) {
    try {
      await confirmDocument(id);
      addToast("Document confirmé", "success");
      setSelected(null);
      load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const labelMap: Record<string, string> = {
    quote: "Devis", order: "Commande", delivery: "Livraison",
    invoice: "Facture", credit_note: "Avoir",
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Documents de vente</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.key}
            onClick={() => setFilter(t.key)}
            className={`touch-button px-4 h-10 rounded-lg border font-medium text-sm whitespace-nowrap ${
              filter === t.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-slate-400 text-center mt-8">Chargement...</p>}
          {!loading && docs.length === 0 && <p className="text-slate-400 text-center mt-8">Aucun document</p>}
          {docs.map((d) => (
            <div key={d.id}
              onClick={() => openDoc(d)}
              className={`p-3 rounded-xl mb-2 cursor-pointer border ${
                selected?.id === d.id
                  ? "bg-blue-50 dark:bg-blue-900 border-blue-300"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}>
              <div className="flex items-center gap-3">
                <span className="font-bold">{d.doc_number}</span>
                <span className="text-sm px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">{labelMap[d.doc_type] || d.doc_type}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  d.status === "confirmed" ? "bg-green-100 text-green-700" :
                  d.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                  d.status === "transformed" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                }`}>{d.status}</span>
                <span className="flex-1" />
                <span className="font-bold text-blue-600">{(d.total_ttc / 1000).toFixed(3)} D</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{d.partner_name} &middot; {new Date(d.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col">
            <h3 className="font-bold text-lg mb-2">{selected.doc_number}</h3>
            <p className="text-sm text-slate-500 mb-3">{selected.partner_name}</p>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {lines.map((l) => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span className="truncate flex-1">{l.article_name} × {l.quantity}</span>
                  <span className="font-medium ml-2">{(l.total_ttc / 1000).toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Total HT</span><span>{(selected.total_ht / 1000).toFixed(3)} D</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total TTC</span><span>{(selected.total_ttc / 1000).toFixed(3)} D</span></div>
            </div>
            <div className="flex gap-2 mt-3">
              {selected.status !== "transformed" && selected.status !== "cancelled" && (
                <button onClick={() => handleTransform(selected.id)}
                  className="touch-button flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-medium">Transformer</button>
              )}
              {selected.status === "draft" && (
                <button onClick={() => handleConfirm(selected.id)}
                  className="touch-button flex-1 h-10 rounded-xl bg-green-600 text-white text-sm font-medium">Confirmer</button>
              )}
              <button onClick={() => printInvoice(selected.id)}
                className="touch-button flex-1 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 text-sm font-medium">Imprimer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
