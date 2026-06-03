import { create } from "zustand";

export interface CartLine {
  article_id: string;
  article_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number; // Percentage discount (0-100)
  discount_amount: number; // Fixed amount discount in millimes
  total_ht: number;
  total_ttc: number;
}

export interface HeldCart {
  id: string;
  name: string;
  lines: CartLine[];
  customer_id: string | null;
  customer_name: string | null;
  customer_balance: number;
  customer_credit_limit: number;
  global_discount_millimes: number;
  defer_payment: boolean;
  createdAt: string;
}

export interface HoldCartContext {
  customer_id?: string | null;
  customer_name?: string | null;
  customer_balance?: number;
  customer_credit_limit?: number;
  global_discount_millimes?: number;
  defer_payment?: boolean;
}

interface CartState {
  lines: CartLine[];
  total_ht: number;
  total_ttc: number;
  heldCarts: HeldCart[];
  addLine: (line: CartLine) => void;
  updateQuantity: (index: number, qty: number) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
  holdCart: (name: string, context?: HoldCartContext) => string;
  restoreCart: (id: string) => HeldCart | null;
  deleteHeldCart: (id: string) => void;
}

function recalc(lines: CartLine[]) {
  const total_ht = lines.reduce((s, l) => {
    // Calculate base price with quantity
    const basePrice = l.unit_price * l.quantity;
    // Apply percentage discount
    const discountPercentAmount = basePrice * (l.discount_percent / 100);
    // Apply fixed discount
    const discountAmount = l.discount_amount / 1000; // Convert millimes to dinars for calculation
    // Calculate final HT price
    const lineTotalHt = basePrice - discountPercentAmount - discountAmount;
    return s + lineTotalHt;
  }, 0);
  
  const total_ttc = lines.reduce((s, l) => {
    // Calculate base price with quantity
    const basePrice = l.unit_price * l.quantity;
    // Apply percentage discount
    const discountPercentAmount = basePrice * (l.discount_percent / 100);
    // Apply fixed discount
    const discountAmount = l.discount_amount / 1000; // Convert millimes to dinars for calculation
    // Calculate final HT price
    const lineTotalHt = basePrice - discountPercentAmount - discountAmount;
    // Apply tax to get TTC
    const lineTotalTtc = lineTotalHt * (1 + l.tax_rate / 100);
    return s + lineTotalTtc;
  }, 0);
  
  return { lines, total_ht, total_ttc };
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  total_ht: 0,
  total_ttc: 0,
  heldCarts: [],
  addLine: (line) =>
    set((s) => {
      const idx = s.lines.findIndex((l) => l.article_id === line.article_id);
      if (idx >= 0) {
        const updated = [...s.lines];
        const existing = updated[idx];
        const qty = existing.quantity + line.quantity;
        // Combine discount values when adding same article
        const discountPercent = (existing.discount_percent * existing.quantity + line.discount_percent * line.quantity) / qty;
        const discountAmount = ((existing.discount_amount * existing.quantity) + (line.discount_amount * line.quantity)) / qty;
        updated[idx] = {
          ...existing,
          quantity: qty,
          discount_percent: +discountPercent.toFixed(3),
          discount_amount: +discountAmount.toFixed(3),
          total_ht: +(qty * existing.unit_price - (qty * existing.unit_price * (discountPercent / 100)) - (discountAmount / 1000)).toFixed(3),
          total_ttc: +((qty * existing.unit_price - (qty * existing.unit_price * (discountPercent / 100)) - (discountAmount / 1000)) * (1 + existing.tax_rate / 100)).toFixed(3),
        };
        return recalc(updated);
      }
      // Calculate totals for new line
      const lineTotalHt = line.unit_price * line.quantity - (line.unit_price * line.quantity * (line.discount_percent / 100)) - (line.discount_amount / 1000);
      const lineTotalTtc = lineTotalHt * (1 + line.tax_rate / 100);
      return recalc([...s.lines, {
        ...line,
        total_ht: +lineTotalHt.toFixed(3),
        total_ttc: +lineTotalTtc.toFixed(3)
      }]);
    }),
  updateQuantity: (index, qty) =>
    set((s) => {
      if (qty <= 0) return recalc(s.lines.filter((_, i) => i !== index));
      const updated = [...s.lines];
      const line = updated[index];
      // Calculate totals for updated quantity
      const lineTotalHt = line.unit_price * qty - (line.unit_price * qty * (line.discount_percent / 100)) - (line.discount_amount / 1000);
      const lineTotalTtc = lineTotalHt * (1 + line.tax_rate / 100);
      updated[index] = {
        ...line,
        quantity: qty,
        total_ht: +lineTotalHt.toFixed(3),
        total_ttc: +lineTotalTtc.toFixed(3)
      };
      return recalc(updated);
    }),
  removeLine: (index) => set((s) => recalc(s.lines.filter((_, i) => i !== index))),
  clearCart: () => set({ lines: [], total_ht: 0, total_ttc: 0 }),
  holdCart: (name, context) => {
    const { lines } = get();
    if (lines.length === 0) return "";
    
    const heldCart: HeldCart = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Ticket ${new Date().toLocaleTimeString()}`,
      lines: [...lines],
      customer_id: context?.customer_id ?? null,
      customer_name: context?.customer_name ?? null,
      customer_balance: context?.customer_balance ?? 0,
      customer_credit_limit: context?.customer_credit_limit ?? 0,
      global_discount_millimes: context?.global_discount_millimes ?? 0,
      defer_payment: context?.defer_payment ?? false,
      createdAt: new Date().toISOString()
    };
    
    set((s) => ({
      heldCarts: [...s.heldCarts, heldCart]
    }));
    
    // Clear current cart after holding
    set({ lines: [], total_ht: 0, total_ttc: 0 });
    
    return heldCart.id;
  },
  restoreCart: (id) => {
    const { heldCarts } = get();
    const heldCart = heldCarts.find(cart => cart.id === id);
    
    if (!heldCart) return null;
    
    // Clear current cart and restore held cart
    set({
      lines: [...heldCart.lines],
      total_ht: heldCart.lines.reduce((sum, line) => sum + line.total_ht, 0),
      total_ttc: heldCart.lines.reduce((sum, line) => sum + line.total_ttc, 0)
    });
    
    return heldCart;
  },
  deleteHeldCart: (id) => {
    set((s) => ({
      heldCarts: s.heldCarts.filter(cart => cart.id !== id)
    }));
  }
}));
