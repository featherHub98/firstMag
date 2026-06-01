import * as React from "react";
import { Barcode, Banknote, CreditCard, Wallet, FileText, ShoppingCart, Search, ScanLine, Check } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { useSessionStore } from "../stores/sessionStore";
import { searchArticles, createDocument, printInvoice, printReceipt, fmtDinars, dinarsToMillimes } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Article, CreateDocumentLine } from "../types";
import { ProductCard } from "@/components/pos/ProductCard";
import { CartLine } from "@/components/pos/CartLine";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type PaymentMode = "cash" | "card" | "cheque" | "transfer";

const paymentModes: { key: PaymentMode; label: string; icon: React.ReactNode }[] = [
  { key: "cash", label: "Espèces", icon: <Banknote className="size-4" /> },
  { key: "card", label: "Carte", icon: <CreditCard className="size-4" /> },
  { key: "cheque", label: "Chèque", icon: <FileText className="size-4" /> },
  { key: "transfer", label: "Virement", icon: <Wallet className="size-4" /> },
];

export default function PosPage() {
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Article[]>([]);
  const [showPay, setShowPay] = React.useState(false);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>("cash");
  const [amountGiven, setAmountGiven] = React.useState("");
  const [lastDocId, setLastDocId] = React.useState("");
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const cartLines = useCartStore((s) => s.lines);
  const totalHt = useCartStore((s) => s.total_ht);
  const totalTtc = useCartStore((s) => s.total_ttc);
  const addLine = useCartStore((s) => s.addLine);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clearCart = useCartStore((s) => s.clearCart);
  const registerOpen = useSessionStore((s) => s.registerOpen);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F1") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "F2" && cartLines.length > 0 && registerOpen) { e.preventDefault(); setShowPay(true); }
      if (e.key === "Escape") { setShowPay(false); setShowReceipt(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartLines.length, registerOpen]);

  const handleSearch = React.useCallback(async (q: string) => {
    setSearch(q);
    if (q.trim().length < 1) { setResults([]); return; }
    try {
      const articles = await searchArticles(q.trim());
      setResults(articles);
    } catch { setResults([]); }
  }, []);

  const addToCart = React.useCallback((a: Article) => {
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
    setHighlightId(a.id);
    setTimeout(() => setHighlightId(null), 400);
    inputRef.current?.focus();
  }, [addLine]);

  const handleKeyDown = React.useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      try {
        const articles = await searchArticles(search.trim());
        if (articles.length > 0) {
          addToCart(articles[0]);
          return;
        }
        addToast("Aucun article trouvé", "error");
      } catch { /* no match */ }
      setSearch("");
      setResults([]);
    }
  }, [search, addToCart, addToast]);

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
      addToast("Vente enregistrée", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  const change = amountGiven
    ? Math.max(0, Math.round(parseFloat(amountGiven || "0") * 1000) - totalTtc)
    : 0;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Caisse"
        description="Scannez ou recherchez un article pour commencer"
        actions={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">F1</kbd>
            <span>Focus</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">F2</kbd>
            <span>Paiement</span>
          </div>
        }
      />

      {!registerOpen && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-center py-2 text-sm font-medium border-b border-amber-200 dark:border-amber-800">
          Caisse fermée — ouvrez une session dans Configuration
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
          <div className="relative">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scanner un code-barres ou rechercher un article..."
              className="h-12 pl-10 text-base"
            />
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto content-start p-1 scrollbar-thin">
            {results.map((a) => (
              <ProductCard
                key={a.id}
                name={a.name}
                priceMillimes={a.sale_price}
                onClick={() => addToCart(a)}
                highlight={highlightId === a.id}
              />
            ))}
            {search.length > 0 && results.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Search className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Aucun article trouvé</p>
              </div>
            )}
            {search.length === 0 && results.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Barcode className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Scannez ou recherchez pour commencer</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col bg-card border-t lg:border-t-0 lg:border-l min-h-0">
          <div className="p-3 border-b flex items-center gap-2">
            <ShoppingCart className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">Ticket</h2>
            <Badge variant="secondary" className="ml-auto">{cartLines.length}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin min-h-0">
            {cartLines.map((line, i) => (
              <CartLine
                key={i}
                name={line.article_name}
                unitPrice={line.unit_price}
                quantity={line.quantity}
                totalTtc={line.total_ttc}
                onIncrement={() => updateQuantity(i, line.quantity + 1)}
                onDecrement={() => updateQuantity(i, line.quantity - 1)}
                onRemove={() => removeLine(i)}
              />
            ))}
            {cartLines.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="size-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm">Ticket vide</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t space-y-3 bg-muted/30">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total HT</span>
              <span className="tabular-nums">{fmtDinars(totalHt)} D</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium">Total TTC</span>
              <span className="text-3xl font-bold tabular-nums">{fmtDinars(totalTtc)} <span className="text-base text-muted-foreground">D</span></span>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearCart} variant="outline" size="lg" className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={() => setShowPay(true)}
                variant="default"
                size="lg"
                disabled={cartLines.length === 0 || !registerOpen}
                className="flex-[2]"
              >
                Paiement
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPay} onOpenChange={setShowPay}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Encaissement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">À encaisser</p>
              <p className="text-4xl font-bold tabular-nums">{fmtDinars(totalTtc)} D</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              {paymentModes.map((m) => (
                <Button
                  key={m.key}
                  variant={paymentMode === m.key ? "default" : "outline"}
                  onClick={() => setPaymentMode(m.key)}
                  className="h-12"
                >
                  {m.icon}
                  {m.label}
                </Button>
              ))}
            </div>
            {paymentMode === "cash" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                    placeholder="0.000"
                    inputMode="decimal"
                    className="h-12 text-lg font-bold text-right tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">D</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setAmountGiven((totalTtc / 1000).toFixed(3))}>
                    Exact
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAmountGiven((parseFloat(amountGiven || "0") + 1).toFixed(3))}>
                    +1
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAmountGiven((parseFloat(amountGiven || "0") + 5).toFixed(3))}>
                    +5
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAmountGiven((parseFloat(amountGiven || "0") + 10).toFixed(3))}>
                    +10
                  </Button>
                </div>
                {change > 0 && (
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3 text-center">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Monnaie à rendre</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmtDinars(change)} D</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPay(false)}>Annuler</Button>
            <Button variant="success" onClick={handlePay} disabled={paymentMode === "cash" && Math.round(parseFloat(amountGiven || "0") * 1000) < totalTtc}>
              <Check className="size-4" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="size-5 text-emerald-600" />
              Vente confirmée
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap border">
            {`      FIRST MAG
  Vente au comptant
${"─".repeat(32)}
`}
            {cartLines.map((l, i) => (
              <span key={i}>
                {`${l.article_name.slice(0, 22).padEnd(22)}
  ${fmtDinars(l.unit_price)} × ${l.quantity}   ${fmtDinars(l.total_ttc)}
`}
              </span>
            ))}
            {`${"─".repeat(32)}
Total TTC:  ${fmtDinars(totalTtc).padStart(12)} D
${paymentMode === "cash" ? `Versé:      ${(parseFloat(amountGiven || "0")).toFixed(3).padStart(12)} D
Monnaie:    ${fmtDinars(change).padStart(12)} D` : `Paiement:  ${paymentModes.find((m) => m.key === paymentMode)?.label}`}
${"─".repeat(32)}
  Merci de votre visite !`}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReceipt(false); inputRef.current?.focus(); }}>
              Nouvelle vente
            </Button>
            <Button onClick={() => { printReceipt(lastDocId); addToast("Ticket imprimé", "info"); }}>
              Ticket
            </Button>
            <Button variant="secondary" onClick={() => { printInvoice(lastDocId); addToast("Facture imprimée", "info"); }}>
              <FileText className="size-4" />
              Facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
