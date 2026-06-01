import { useState, useCallback, useRef, useEffect } from "react";
import { useCartStore } from "../stores/cartStore";
import { useSessionStore } from "../stores/sessionStore";
import { searchArticles, createDocument, printInvoice, printReceipt, fmtDinars, dinarsToMillimes } from "../api";
import type { Article, CreateDocumentLine } from "../types";

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [showPay, setShowPay] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountGiven, setAmountGiven] = useState("");
  const [lastDocId, setLastDocId] = useState("");
  const cartLines = useCartStore((s) => s.lines);
  const totalHt = useCartStore((s) => s.total_ht);
  const totalTtc = useCartStore((s) => s.total_ttc);
  const addLine = useCartStore((s) => s.addLine);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clearCart = useCartStore((s) => s.clearCart);
  const registerOpen = useSessionStore((s) => s.registerOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F1") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "F2" && cartLines.length > 0 && registerOpen) { e.preventDefault(); setShowPay(true); }
      if (e.key === "Escape") { setShowPay(false); setShowReceipt(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartLines.length, registerOpen]);

  const handleSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (q.trim().length < 1) { setResults([]); return; }
    try {
      const articles = await searchArticles(q.trim());
      setResults(articles);
    } catch { setResults([]); }
  }, []);

  const addToCart = useCallback((a: Article) => {
    addLine({
      article_id: a.id,
      article_name: a.name,
      barcode: a.barcode,
      quantity: 1,
      unit_price: a.sale_price,
      tax_rate: 19,
      total_ht: a.sale_price,
      total_ttc: a.sale_price + a.sale_price * 19 / 100,
    });
    setSearch("");
    setResults([]);
    inputRef.current?.focus();
  }, [addLine]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      try {
        const articles = await searchArticles(search.trim());
        if (articles.length === 1) {
          addToCart(articles[0]);
          return;
        }
        if (articles.length > 0) {
          addToCart(articles[0]);
          return;
        }
      } catch { /* no match */ }
      setSearch("");
      setResults([]);
    }
  }, [search, addToCart]);

  async function handlePay() {
    if (cartLines.length === 0 || !registerOpen) return;
    const lines: CreateDocumentLine[] = cartLines.map((l) => ({
      article_id: l.article_id,
      article_name: l.article_name,
      quantity: l.quantity,
      unit_price: dinarsToMillimes(l.unit_price),
      tax_rate: l.tax_rate,
    }));
    try {
      const [doc] = await createDocument({
        doc_type: "invoice",
        partner_id: "walk-in",
        partner_name: "Client comptant",
        notes: "",
        lines,
      });
      setLastDocId(doc.id);
      clearCart();
      setShowPay(false);
      setShowReceipt(true);
    } catch (e) {
      console.error("Payment failed", e);
    }
  }

  const change = amountGiven
    ? Math.max(0, parseFloat(amountGiven) * 1000 - totalTtc)
    : 0;

  return (
    <div className="h-full flex flex-col">
      {!registerOpen && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-center py-2 text-sm font-medium">
          Caisse fermée — ouvrez une session dans Réglages (F1: recherche, F2: paiement)
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        <div className="flex-1 flex flex-col p-3 gap-3 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un article ou scanner un code-barres... (F1 focus, F2 paiement)"
            className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto content-start">
            {results.map((a) => (
              <button
                key={a.id}
                onClick={() => addToCart(a)}
                className="touch-button bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow min-h-[80px]"
              >
                <span className="text-sm font-medium text-center leading-tight">{a.name}</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmtDinars(a.sale_price)} D</span>
              </button>
            ))}
            {search.length > 0 && results.length === 0 && (
              <p className="col-span-full text-center text-slate-400 mt-8 text-sm">Aucun article trouvé</p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg">Ticket en cours</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cartLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{line.article_name}</p>
                  <p className="text-xs text-slate-500">{fmtDinars(line.unit_price)} × {line.quantity}</p>
                </div>
                <button onClick={() => updateQuantity(i, line.quantity - 1)}
                  className="touch-button w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 text-sm font-bold">−</button>
                <span className="w-8 text-center font-bold">{line.quantity}</span>
                <button onClick={() => updateQuantity(i, line.quantity + 1)}
                  className="touch-button w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 text-sm font-bold">+</button>
                <span className="w-20 text-right font-bold">{fmtDinars(line.total_ttc)}</span>
                <button onClick={() => removeLine(i)}
                  className="touch-button w-8 h-8 rounded-full text-red-500 text-lg">×</button>
              </div>
            ))}
            {cartLines.length === 0 && (
              <p className="text-slate-400 text-sm text-center mt-8">Ticket vide</p>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total HT</span>
              <span>{fmtDinars(totalHt)} D</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-blue-600 dark:text-blue-400">
              <span>Total TTC</span>
              <span>{fmtDinars(totalTtc)} D</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clearCart}
                className="touch-button flex-1 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 font-medium">Annuler</button>
              <button onClick={() => setShowPay(true)}
                className="touch-button flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-50"
                disabled={cartLines.length === 0 || !registerOpen}>Paiement</button>
            </div>
          </div>
        </div>
      </div>

      {showPay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPay(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Paiement</h3>
            <p className="text-3xl font-bold text-center mb-4 text-blue-600">{fmtDinars(totalTtc)} D</p>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full h-12 rounded-xl px-4 mb-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
              <option value="cash">Espèces</option>
              <option value="card">Carte bancaire</option>
              <option value="cheque">Chèque</option>
              <option value="transfer">Virement</option>
            </select>
            {paymentMode === "cash" && (
              <>
                <input type="number" value={amountGiven} onChange={(e) => setAmountGiven(e.target.value)}
                  placeholder="Montant reçu (D)"
                  className="w-full h-12 rounded-xl px-4 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
                <div className="flex gap-1 mb-2">
                  <button onClick={() => setAmountGiven((totalTtc / 1000).toFixed(3))}
                    className="touch-button flex-1 h-8 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium">Exact</button>
                  <button onClick={() => setAmountGiven(a => (parseFloat(a || "0") + 1).toFixed(3))}
                    className="touch-button flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium">+1 D</button>
                  <button onClick={() => setAmountGiven(a => (parseFloat(a || "0") + 5).toFixed(3))}
                    className="touch-button flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium">+5 D</button>
                  <button onClick={() => setAmountGiven(a => (parseFloat(a || "0") + 10).toFixed(3))}
                    className="touch-button flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium">+10 D</button>
                </div>
              </>
            )}
            {change > 0 && (
              <p className="text-green-600 font-bold text-center mb-3">Monnaie: {fmtDinars(change)} D</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowPay(false)}
                className="touch-button flex-1 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 font-medium">Annuler</button>
              <button onClick={handlePay}
                className="touch-button flex-[2] h-12 rounded-xl bg-green-600 text-white font-bold">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowReceipt(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Vente confirmée</h3>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {`      FIRST MAG
  Vente au comptant
${"─".repeat(32)}
`}
              {cartLines.map((l, i) => (
                <span key={i}>
                  {`${l.article_name.slice(0, 22)}
   ${fmtDinars(l.unit_price)} × ${l.quantity}   ${fmtDinars(l.total_ttc)}
`}
                </span>
              ))}
              {`${"─".repeat(32)}
Total TTC:   ${fmtDinars(totalTtc).padStart(12)} D
${paymentMode === "cash" ? `Versé:        ${parseFloat(amountGiven || "0").toFixed(3).padStart(12)} D
Monnaie:      ${fmtDinars(change).padStart(12)} D` : `Paiement:    ${paymentMode === "card" ? "Carte" : paymentMode === "cheque" ? "Chèque" : "Virement"}`}
${"─".repeat(32)}
  Merci de votre visite !
`}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowReceipt(false); inputRef.current?.focus(); }}
                className="touch-button flex-1 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 font-medium">Nouveau</button>
              <button onClick={() => { printReceipt(lastDocId); }}
                className="touch-button flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold">Ticket</button>
              <button onClick={() => { printInvoice(lastDocId); }}
                className="touch-button flex-1 h-12 rounded-xl bg-slate-700 text-white font-bold">Facture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
