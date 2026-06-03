import * as React from "react";
import { Barcode, Banknote, CreditCard, Wallet, FileText, ShoppingCart, Search, ScanLine, Check, Trash2, Clock, User } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import type { CartLine as CartStoreLine, HeldCart as HeldCartState, HoldCartContext } from "../stores/cartStore";
import { useSessionStore } from "../stores/sessionStore";
import { searchArticles, createDocument, printInvoice, printReceipt, printCheque, setDocumentStatus, getPartner, getPartnerProfile, fmtDinars, dinarsToMillimes } from "../api";
import { searchPartners } from "../api/partnerApi";
import { useToastStore } from "../api/toastStore";
import type { Article, CreateDocumentLine, Partner } from "../types";
import { ProductCard } from "@/components/pos/ProductCard";
import { CartLine } from "@/components/pos/CartLine";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import RegisterOpening from "@/components/pos/RegisterOpening";
import { CashMovementJournal } from "@/components/pos/CashMovementJournal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type PaymentMode = "cash" | "card" | "cheque" | "transfer";
type PaymentLineDraft = {
  id: string;
  mode: PaymentMode;
  amount: string;
  reference: string;
  chequeBank: string;
  chequeDueDate: string;
};

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
   const [showHeld, setShowHeld] = React.useState(false);
   const [showCustomerSearch, setShowCustomerSearch] = React.useState(false);
   const [showCashMovement, setShowCashMovement] = React.useState(false);
   const [paymentMode, setPaymentMode] = React.useState<PaymentMode>("cash");
   const [paymentLines, setPaymentLines] = React.useState<PaymentLineDraft[]>([]);
   const [globalDiscountMillimes, setGlobalDiscountMillimes] = React.useState(0);
   const [deferPayment, setDeferPayment] = React.useState(false);
   const [lastDocId, setLastDocId] = React.useState("");
   const [receiptLines, setReceiptLines] = React.useState<CartStoreLine[]>([]);
   const [receiptTotalTtc, setReceiptTotalTtc] = React.useState(0);
   const [receiptCustomerLabel, setReceiptCustomerLabel] = React.useState("Vente au comptant");
   const [receiptPayments, setReceiptPayments] = React.useState<PaymentLineDraft[]>([]);
   const [receiptChange, setReceiptChange] = React.useState(0);
   const [receiptStatus, setReceiptStatus] = React.useState<"partial" | "paid">("paid");
   const [highlightId, setHighlightId] = React.useState<string | null>(null);
   const [customerSearch, setCustomerSearch] = React.useState("");
   const [customerResults, setCustomerResults] = React.useState<Partner[]>([]);
   const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
   const [selectedCustomer, setSelectedCustomer] = React.useState<Partner | null>(null);
   const cartLines = useCartStore((s) => s.lines);
   const totalHt = useCartStore((s) => s.total_ht);
   const totalTtc = useCartStore((s) => s.total_ttc);
   const addLine = useCartStore((s) => s.addLine);
   const updateQuantity = useCartStore((s) => s.updateQuantity);
   const removeLine = useCartStore((s) => s.removeLine);
   const clearCart = useCartStore((s) => s.clearCart);
   const holdCart = useCartStore((s) => s.holdCart);
   const restoreCart = useCartStore((s) => s.restoreCart);
   const deleteHeldCart = useCartStore((s) => s.deleteHeldCart);
   const heldCarts = useCartStore((s) => s.heldCarts);
   const registerOpen = useSessionStore((s) => s.registerOpen);
   const customerName = useSessionStore((s) => s.customerName);
   const customerBalance = useSessionStore((s) => s.customerBalance);
   const setCustomer = useSessionStore((s) => s.setCustomer);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

   React.useEffect(() => {
     function onKey(e: KeyboardEvent) {
       const target = e.target as HTMLElement | null;
       const tag = target?.tagName?.toLowerCase();
       const isTypingField =
         tag === "input" || tag === "textarea" || target?.isContentEditable === true;

       // If focus is lost from the scanner field, keep numpad/keyboard entry working.
       if (!isTypingField && document.activeElement === document.body) {
         const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
         if (isPrintable || e.key === "Backspace") {
           e.preventDefault();
           const nextValue =
             e.key === "Backspace"
               ? search.slice(0, -1)
               : `${search}${e.key === "," ? "." : e.key}`;
           setSearch(nextValue);
           if (nextValue.trim().length < 1) {
             setResults([]);
           } else {
             void searchArticles(nextValue.trim())
               .then(setResults)
               .catch(() => setResults([]));
           }
           requestAnimationFrame(() => inputRef.current?.focus());
           return;
         }
       }

       if (e.key === "F1") { e.preventDefault(); inputRef.current?.focus(); }
       if (e.key === "F2" && cartLines.length > 0 && registerOpen) { e.preventDefault(); setShowPay(true); }
       if (e.key === "F3") {
         e.preventDefault();
         if (cartLines.length > 0) {
           handleHoldCurrentTicket();
         } else {
           setShowHeld(true);
         }
       }
       if (e.key === "F4") { e.preventDefault(); setShowCustomerSearch(true); }
       if (e.key === "F5") { e.preventDefault(); setShowCashMovement(true); }
       if (e.key === "Escape") { 
         setShowPay(false); 
         setShowReceipt(false); 
         setShowHeld(false); 
         setShowCustomerSearch(false); 
         setShowCashMovement(false); 
       }
     }
     window.addEventListener("keydown", onKey);
     return () => window.removeEventListener("keydown", onKey);
   }, [cartLines.length, registerOpen, search]);

   const handleSearch = React.useCallback(async (q: string) => {
     setSearch(q);
     if (q.trim().length < 1) { setResults([]); return; }
     try {
       const articles = await searchArticles(q.trim());
       setResults(articles);
     } catch { setResults([]); }
   }, []);

   const handleCustomerSearch = React.useCallback(async (q: string) => {
     setCustomerSearch(q);
     if (q.trim().length < 1) { setCustomerResults([]); return; }
     try {
       const partners = await searchPartners(q.trim());
       // Filter to only show clients (not suppliers)
       const clients = partners.filter(p => p.partner_type === "client");
       setCustomerResults(clients);
     } catch { setCustomerResults([]); }
   }, []);

   const addToCart = React.useCallback((a: Article) => {
     addLine({
       article_id: a.id,
       article_name: a.name,
       barcode: a.barcode,
       quantity: 1,
       unit_price: a.sale_price,
       tax_rate: 19,
       discount_percent: 0,
       discount_amount: 0,
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

  function makePaymentLine(mode: PaymentMode, amountMillimes: number): PaymentLineDraft {
    return {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode,
      amount: (amountMillimes / 1000).toFixed(3),
      reference: "",
      chequeBank: "",
      chequeDueDate: "",
    };
  }

  const paidTotal = React.useMemo(
    () =>
      paymentLines.reduce((sum, line) => {
        const value = Math.round((parseFloat(line.amount || "0") || 0) * 1000);
        return sum + Math.max(0, value);
      }, 0),
    [paymentLines],
  );
  const nonCashPaid = React.useMemo(
    () =>
      paymentLines
        .filter((line) => line.mode !== "cash")
        .reduce((sum, line) => {
          const value = Math.round((parseFloat(line.amount || "0") || 0) * 1000);
          return sum + Math.max(0, value);
        }, 0),
    [paymentLines],
  );
  const cashPaid = React.useMemo(
    () =>
      paymentLines
        .filter((line) => line.mode === "cash")
        .reduce((sum, line) => {
          const value = Math.round((parseFloat(line.amount || "0") || 0) * 1000);
          return sum + Math.max(0, value);
        }, 0),
    [paymentLines],
  );

  const discountedTotalTtc = Math.max(0, totalTtc - globalDiscountMillimes);
  const remainingAfterNonCash = Math.max(0, discountedTotalTtc - nonCashPaid);
  const remainingToPay = Math.max(0, discountedTotalTtc - paidTotal);
  const change = Math.max(0, cashPaid - remainingAfterNonCash);
  const outstandingDebt = Math.max(0, -customerBalance);
  const availableCredit = selectedCustomer ? Math.max(0, selectedCustomer.credit_limit - outstandingDebt) : 0;

  React.useEffect(() => {
    if (!showPay) return;
    if (paymentLines.length === 0) {
      setPaymentLines([makePaymentLine(paymentMode, discountedTotalTtc)]);
    }
  }, [showPay, paymentMode, paymentLines.length, discountedTotalTtc]);

  React.useEffect(() => {
    if (!selectedCustomerId && deferPayment) {
      setDeferPayment(false);
    }
  }, [selectedCustomerId, deferPayment]);

  function addPaymentLine(mode: PaymentMode = paymentMode) {
    setPaymentLines((prev) => [...prev, makePaymentLine(mode, 0)]);
  }

  function updatePaymentLine(id: string, patch: Partial<PaymentLineDraft>) {
    setPaymentLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function removePaymentLine(id: string) {
    setPaymentLines((prev) => prev.filter((line) => line.id !== id));
  }

  function setFirstCashAmount(valueDinars: number) {
    const value = Math.max(0, valueDinars);
    setPaymentLines((prev) => {
      const cashIdx = prev.findIndex((line) => line.mode === "cash");
      const amount = value.toFixed(3);
      if (cashIdx < 0) {
        return [...prev, { ...makePaymentLine("cash", 0), amount }];
      }
      const clone = [...prev];
      clone[cashIdx] = { ...clone[cashIdx], amount };
      return clone;
    });
  }

  function buildHoldContext(): HoldCartContext {
    return {
      customer_id: selectedCustomerId,
      customer_name: selectedCustomer?.name || customerName || null,
      customer_balance: customerBalance,
      customer_credit_limit: selectedCustomer?.credit_limit || 0,
      global_discount_millimes: globalDiscountMillimes,
      defer_payment: deferPayment,
    };
  }

  async function applyRestoredContext(heldCart: HeldCartState) {
    setGlobalDiscountMillimes(heldCart.global_discount_millimes || 0);
    setDeferPayment(Boolean(heldCart.defer_payment));
    if (heldCart.customer_id && heldCart.customer_name) {
      setSelectedCustomerId(heldCart.customer_id);
      try {
        const partner = await getPartner(heldCart.customer_id);
        setSelectedCustomer(partner);
        setCustomer(partner.id, partner.name, partner.balance);
      } catch {
        setSelectedCustomer({
          id: heldCart.customer_id,
          partner_type: "client",
          code: "",
          name: heldCart.customer_name,
          address: "",
          phone: "",
          email: "",
          tax_id: "",
          country_id: null,
          credit_limit: heldCart.customer_credit_limit || 0,
          balance: heldCart.customer_balance || 0,
          notes: "",
          salesperson_id: null,
          active: true,
          created_at: "",
          updated_at: "",
        });
        setCustomer(heldCart.customer_id, heldCart.customer_name, heldCart.customer_balance || 0);
      }
      return;
    }
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    setCustomer(null, null, 0);
  }

  function handleHoldCurrentTicket() {
    if (cartLines.length === 0) {
      addToast("Aucun article a mettre en attente", "info");
      return;
    }
    const id = holdCart("", buildHoldContext());
    if (!id) {
      addToast("Impossible de mettre le ticket en attente", "error");
      return;
    }
    setShowHeld(true);
    addToast("Ticket mis en attente", "success");
  }

  async function applyCustomerProfileDefaults(partnerId: string) {
    try {
      const profile = await getPartnerProfile(partnerId);
      if (profile.global_discount_millimes > 0) {
        setGlobalDiscountMillimes(profile.global_discount_millimes);
      }
      if (profile.allow_deferred_payment && availableCredit > 0) {
        setDeferPayment(true);
      }
    } catch {
      // optional profile defaults
    }
  }

  async function handlePay() {
    if (cartLines.length === 0 || !registerOpen) return;
    if (paymentLines.length === 0) {
      addToast("Ajoutez au moins une ligne de paiement", "error");
      return;
    }
    for (const line of paymentLines) {
      const amount = Math.round((parseFloat(line.amount || "0") || 0) * 1000);
      if (amount <= 0) {
        addToast("Chaque ligne de paiement doit avoir un montant valide", "error");
        return;
      }
      if (line.mode === "cheque" && !line.reference.trim()) {
        addToast("Le numéro de chèque est obligatoire", "error");
        return;
      }
    }
    if (nonCashPaid > discountedTotalTtc) {
      addToast("Les paiements non espèces dépassent le montant à encaisser", "error");
      return;
    }
    if (!deferPayment && paidTotal < discountedTotalTtc) {
      addToast("Montant encaissé insuffisant", "error");
      return;
    }

    const partnerId = selectedCustomerId || "walk-in";
    const partnerName = selectedCustomerId
      ? selectedCustomer?.name || customerName || "Client"
      : "Client comptant";

    const lines: CreateDocumentLine[] = cartLines.map((l) => {
      const basePrice = l.unit_price;
      const discountPercentAmount = basePrice * (l.discount_percent / 100);
      const discountAmount = l.discount_amount / 1000;
      const baseNetUnitPrice = basePrice - discountPercentAmount - discountAmount;
      const discountRatio = totalTtc > 0 ? discountedTotalTtc / totalTtc : 1;
      const finalUnitPrice = Math.max(0, baseNetUnitPrice * discountRatio);
      return {
        article_id: l.article_id,
        article_name: l.article_name,
        quantity: l.quantity,
        unit_price: dinarsToMillimes(finalUnitPrice),
        tax_rate: l.tax_rate,
      };
    });

    const paymentNote = paymentLines
      .map((line) => {
        const parts: string[] = [`${line.mode.toUpperCase()}: ${line.amount} D`];
        if (line.reference.trim()) parts.push(`Ref ${line.reference.trim()}`);
        if (line.chequeBank.trim()) parts.push(`Banque ${line.chequeBank.trim()}`);
        if (line.chequeDueDate.trim()) parts.push(`Échéance ${line.chequeDueDate.trim()}`);
        return parts.join(" | ");
      })
      .join("\n");
    const settlementStatus: "partial" | "paid" = paidTotal >= discountedTotalTtc ? "paid" : "partial";
    const dueAmount = Math.max(0, discountedTotalTtc - paidTotal);
    if (deferPayment) {
      if (!selectedCustomerId || !selectedCustomer) {
        addToast("Le paiement differe exige un client selectionne", "error");
        return;
      }
      const allowedCredit = Math.max(0, selectedCustomer.credit_limit - Math.max(0, -customerBalance));
      if (dueAmount > allowedCredit) {
        addToast(`Credit insuffisant (disponible: ${fmtDinars(allowedCredit)} D)`, "error");
        return;
      }
    }

    try {
      const [doc] = await createDocument({
        doc_type: "invoice",
        partner_id: partnerId,
        partner_name: partnerName,
        notes: [
          paymentNote,
          globalDiscountMillimes > 0 ? `REMISE_GLOBALE: ${fmtDinars(globalDiscountMillimes)} D` : "",
          settlementStatus === "partial" ? `RESTE_A_PAYER: ${fmtDinars(dueAmount)} D` : "",
        ].filter(Boolean).join("\n"),
        lines,
      });
      await setDocumentStatus(doc.id, settlementStatus);
      setLastDocId(doc.id);
      setReceiptLines(cartLines);
      setReceiptTotalTtc(discountedTotalTtc);
      setReceiptCustomerLabel(selectedCustomerId ? `Client: ${customerName || partnerName}` : "Vente au comptant");
      setReceiptPayments(paymentLines);
      setReceiptChange(change);
      setReceiptStatus(settlementStatus);
      if (selectedCustomerId && selectedCustomer && settlementStatus === "partial") {
        const nextBalance = customerBalance - dueAmount;
        setCustomer(selectedCustomerId, selectedCustomer.name, nextBalance);
        setSelectedCustomer({ ...selectedCustomer, balance: nextBalance });
      }
      clearCart();
      setShowPay(false);
      setShowReceipt(true);
      setPaymentLines([]);
      setGlobalDiscountMillimes(0);
      setDeferPayment(false);
      addToast("Vente enregistrée", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

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
             <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">F3</kbd>
             <span>En attente</span>
             <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">F4</kbd>
             <span>Client</span>
             <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">F5</kbd>
             <span>Mouvements</span>
           </div>
         }
       />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
          <div className="relative">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              data-scanner-focus="true"
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
                 discountPercent={line.discount_percent}
                 discountAmount={line.discount_amount}
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
                onClick={handleHoldCurrentTicket}
                variant="outline"
                size="lg"
                disabled={cartLines.length === 0}
                className="flex-1"
              >
                En attente
              </Button>
              <Button
                onClick={() => setShowPay(true)}
                variant="default"
                size="lg"
                disabled={cartLines.length === 0 || !registerOpen}
                className="flex-1"
              >
                Paiement
              </Button>
            </div>
          </div>
        </div>
      </div>

       {/* Register Opening Component */}
       <RegisterOpening />

       {/* Cash Movement Journal Dialog */}
       {showCashMovement && <CashMovementJournal onClose={() => setShowCashMovement(false)} />}

       {/* Customer Search Dialog */}
       <Dialog open={showCustomerSearch} onOpenChange={setShowCustomerSearch}>
         <DialogContent className="max-w-md w-full sm:max-w-sm">
           <DialogHeader>
             <DialogTitle>Sélection du client</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               <Input
                 value={customerSearch}
                 onChange={(e) => handleCustomerSearch(e.target.value)}
                 placeholder="Rechercher un client par nom, code ou téléphone..."
                 className="h-12 pl-10 text-base"
               />
             </div>
             
             {customerSearch.length > 0 && customerResults.length === 0 ? (
               <div className="text-center py-8">
                 <Search className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                 <p className="text-sm text-muted-foreground">Aucun client trouvé</p>
               </div>
             ) : (
               <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin p-1">
                 {customerResults.map((partner) => (
                   <Button
                     key={partner.id}
                     variant={selectedCustomerId === partner.id ? "default" : "outline"}
                     onClick={() => {
                       setSelectedCustomerId(partner.id);
                       setSelectedCustomer(partner);
                       // Update session with customer info
                        setCustomer(
                          partner.id, 
                          partner.name, 
                          partner.balance
                        );
                        void applyCustomerProfileDefaults(partner.id);
                        setShowCustomerSearch(false);
                       addToast(`Client sélectionné: ${partner.name}`, "success");
                     }}
                     className="w-full text-left flex items-center justify-between px-4 py-3"
                   >
                     <div className="flex-1 min-w-0">
                       <p className="font-medium">{partner.name}</p>
                       <p className="text-xs text-muted-foreground">
                         {partner.code} • {partner.phone}
                       </p>
                     </div>
                     {partner.balance !== 0 && (
                       <span className="px-2 py-0.5 rounded text-xs">
                         {partner.balance >= 0 ? (
                           <>
                             <span className="text-green-600">+{fmtDinars(partner.balance)} D</span>
                           </>
                         ) : (
                           <>
                             <span className="text-red-600">{fmtDinars(partner.balance)} D</span>
                           </>
                         )}
                       </span>
                     )}
                    </Button>
                  ))}
               </div>
             )}
             
             {customerSearch.length === 0 && customerResults.length === 0 && (
               <div className="text-center py-8">
                 <User className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                 <p className="text-sm text-muted-foreground">Recherchez un client pour commencer</p>
               </div>
             )}
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => {
               setSelectedCustomerId(null);
               setSelectedCustomer(null);
               setDeferPayment(false);
               setCustomer(null, null, 0);
               setShowCustomerSearch(false);
             }}>
               Annuler
             </Button>
             {selectedCustomerId !== null && (
               <Button variant="success" onClick={() => {
                 setShowCustomerSearch(false);
               }}>
                 Utiliser ce client
               </Button>
             )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

       {/* Held/Suspended Tickets Dialog */}
       <Dialog open={showHeld} onOpenChange={setShowHeld}>
         <DialogContent className="max-w-md w-full sm:max-w-sm">
           <DialogHeader>
             <DialogTitle>Tickets en attente</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             {heldCarts.length === 0 ? (
               <div className="text-center py-8">
                 <Clock className="size-12 mx-auto text-muted-foreground/40 mb-3" />
                 <p className="text-sm text-muted-foreground">Aucun ticket en attente</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {heldCarts.map((cart) => (
                   <Button
                     key={cart.id}
                     variant="outline"
                     onClick={async () => {
                       if (cartLines.length > 0) {
                         const heldCurrent = holdCart("Ticket courant", buildHoldContext());
                         if (heldCurrent) {
                           addToast("Ticket courant mis en attente avant restauration", "info");
                         }
                       }
                       const restored = restoreCart(cart.id);
                       if (restored) {
                         await applyRestoredContext(restored);
                         deleteHeldCart(cart.id);
                         setShowHeld(false);
                         addToast(`Ticket "${cart.name}" restauré`, "success");
                       }
                     }}
                     className="w-full text-left flex items-center justify-between px-4 py-3"
                   >
                     <div className="flex-1 min-w-0">
                       <p className="font-medium">{cart.name}</p>
                       <p className="text-xs text-muted-foreground">
                         {new Date(cart.createdAt).toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                       <Badge variant="secondary">{cart.lines.length}</Badge>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={async (e) => {
                           e.stopPropagation();
                           if (cartLines.length > 0) {
                             const heldCurrent = holdCart("Ticket courant", buildHoldContext());
                             if (heldCurrent) {
                               addToast("Ticket courant mis en attente avant encaissement", "info");
                             }
                           }
                           const restored = restoreCart(cart.id);
                           if (restored) {
                             await applyRestoredContext(restored);
                             deleteHeldCart(cart.id);
                             setShowHeld(false);
                             setShowPay(true);
                             addToast(`Ticket "${cart.name}" restauré pour encaissement`, "success");
                           }
                         }}
                         aria-label="Restaurer et encaisser"
                       >
                         <Check className="size-4" />
                       </Button>
                       <Button
                         variant="ghost"
                                     size="icon"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       deleteHeldCart(cart.id);
                                       addToast("Ticket supprimé", "info");
                                     }}
                                     aria-label="Supprimer le ticket"
                                   >
                                     <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </Button>
                              ))}
             </div>
           )}
         </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHeld(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>

       <Dialog
         open={showPay}
         onOpenChange={(open) => {
           setShowPay(open);
           if (!open) {
             setPaymentLines([]);
             setGlobalDiscountMillimes(0);
             setDeferPayment(false);
           }
         }}
       >
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle>Encaissement</DialogTitle>
             </DialogHeader>
             <div className="space-y-4">
               <div className="text-center">
                 <p className="text-sm text-muted-foreground">À encaisser</p>
                 <p className="text-4xl font-bold tabular-nums">{fmtDinars(discountedTotalTtc)} D</p>
                 {globalDiscountMillimes > 0 && (
                   <p className="text-xs text-muted-foreground mt-1">
                     Remise globale: -{fmtDinars(globalDiscountMillimes)} D
                   </p>
                 )}
                 {selectedCustomer && (
                   <p className="text-xs text-muted-foreground">
                     Credit client: {fmtDinars(selectedCustomer.credit_limit)} D • Solde courant: {fmtDinars(customerBalance)} D • Credit dispo: {fmtDinars(availableCredit)} D
                   </p>
                 )}
               </div>
               <Separator />
               {/* Discount Controls */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Remise</span>
                   <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setGlobalDiscountMillimes(Math.round(totalTtc * 0.05))}
                     >
                       -5%
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setGlobalDiscountMillimes(Math.round(totalTtc * 0.1))}
                     >
                       -10%
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setGlobalDiscountMillimes(Math.min(totalTtc, 5000))}
                     >
                       -5DT
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => setGlobalDiscountMillimes(0)}>
                       RAZ
                     </Button>
                   </div>
                 </div>
                 {selectedCustomerId && (
                   <div className="flex items-center gap-2">
                     <Checkbox
                       id="defer-payment"
                       checked={deferPayment}
                       disabled={remainingToPay > 0 && availableCredit <= 0}
                       onCheckedChange={(checked) => setDeferPayment(Boolean(checked))}
                     />
                     <Label htmlFor="defer-payment" className="text-xs text-muted-foreground">
                       Différer le règlement client (paiement partiel autorisé)
                     </Label>
                   </div>
                 )}
               </div>
               {/* End Discount Controls */}
               <div className="grid grid-cols-2 gap-2">
                 {paymentModes.map((m) => (
                   <Button
                     key={m.key}
                     variant={paymentMode === m.key ? "default" : "outline"}
                     onClick={() => {
                       setPaymentMode(m.key);
                       addPaymentLine(m.key);
                     }}
                     className="h-12"
                   >
                     {m.icon}
                     {m.label}
                   </Button>
                 ))}
               </div>
               <div className="space-y-2">
                 {paymentLines.map((line) => (
                   <div key={line.id} className="rounded-lg border p-2 space-y-2">
                     <div className="flex items-center gap-2">
                       <select
                         className="h-9 rounded border bg-background px-2 text-sm"
                         value={line.mode}
                         onChange={(e) => updatePaymentLine(line.id, { mode: e.target.value as PaymentMode })}
                       >
                         {paymentModes.map((m) => (
                           <option key={m.key} value={m.key}>
                             {m.label}
                           </option>
                         ))}
                       </select>
                       <Input
                         value={line.amount}
                         onChange={(e) => updatePaymentLine(line.id, { amount: e.target.value })}
                         placeholder="0.000"
                         inputMode="decimal"
                         className="h-9 text-right tabular-nums"
                       />
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => removePaymentLine(line.id)}
                         aria-label="Supprimer ligne paiement"
                       >
                         <Trash2 className="size-4" />
                       </Button>
                     </div>
                     {(line.mode === "cheque" || line.mode === "transfer") && (
                       <Input
                         value={line.reference}
                         onChange={(e) => updatePaymentLine(line.id, { reference: e.target.value })}
                         placeholder={line.mode === "cheque" ? "Numéro chèque" : "Référence virement"}
                         className="h-9"
                       />
                     )}
                     {line.mode === "cheque" && (
                       <div className="grid grid-cols-2 gap-2">
                         <Input
                           value={line.chequeBank}
                           onChange={(e) => updatePaymentLine(line.id, { chequeBank: e.target.value })}
                           placeholder="Banque"
                           className="h-9"
                         />
                         <Input
                           type="date"
                           value={line.chequeDueDate}
                           onChange={(e) => updatePaymentLine(line.id, { chequeDueDate: e.target.value })}
                           className="h-9"
                         />
                       </div>
                     )}
                   </div>
                 ))}
                 <div className="grid grid-cols-4 gap-1.5">
                   <Button variant="outline" size="sm" onClick={() => setFirstCashAmount(discountedTotalTtc / 1000)}>
                     Exact
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => setFirstCashAmount(cashPaid / 1000 + 1)}>
                     +1
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => setFirstCashAmount(cashPaid / 1000 + 5)}>
                     +5
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => setFirstCashAmount(cashPaid / 1000 + 10)}>
                     +10
                   </Button>
                 </div>
                 <div className="rounded-lg border p-3 text-sm space-y-1">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Total payé</span>
                     <span className="font-mono">{fmtDinars(paidTotal)} D</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Reste</span>
                     <span className="font-mono">{fmtDinars(remainingToPay)} D</span>
                   </div>
                   {change > 0 && (
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Monnaie à rendre</span>
                       <span className="font-mono">{fmtDinars(change)} D</span>
                     </div>
                   )}
                 </div>
               </div>
             </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPay(false);
                setPaymentLines([]);
                setGlobalDiscountMillimes(0);
                setDeferPayment(false);
              }}
            >
              Annuler
            </Button>
            <Button variant="success" onClick={handlePay} disabled={!deferPayment && paidTotal < discountedTotalTtc}>
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
${receiptCustomerLabel}
${"─".repeat(32)}
`}
             {receiptLines.map((l, i) => (
               <span key={i}>
                 {`${l.article_name.slice(0, 22).padEnd(22)}
    ${fmtDinars(l.unit_price)} × ${l.quantity}   ${fmtDinars(l.total_ttc)}
`}
                </span>
             ))}
             {`${"─".repeat(32)}
Total TTC:  ${fmtDinars(receiptTotalTtc).padStart(12)} D
${receiptPayments.map((line) => `${line.mode.toUpperCase().padEnd(8)} ${line.amount.padStart(12)} D`).join("\n")}
${receiptChange > 0 ? `Monnaie:    ${fmtDinars(receiptChange).padStart(12)} D` : ""}
${receiptStatus === "partial" ? "Statut:     REGLEMENT PARTIEL" : "Statut:     REGLE"}
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
             {receiptPayments.some((p) => p.mode === "cheque") && (
               <Button onClick={() => { 
                 printCheque(lastDocId); 
                 addToast("Chèque imprimé", "info"); 
               }}>
                 <FileText className="size-4" />
                 Chèque
               </Button>
             )}
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
