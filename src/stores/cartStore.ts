import { create } from "zustand";

export interface CartLine {
  article_id: string;
  article_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_ht: number;
  total_ttc: number;
}

interface CartState {
  lines: CartLine[];
  total_ht: number;
  total_ttc: number;
  addLine: (line: CartLine) => void;
  updateQuantity: (index: number, qty: number) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
}

function recalc(lines: CartLine[]) {
  const total_ht = lines.reduce((s, l) => s + l.total_ht, 0);
  const total_ttc = lines.reduce((s, l) => s + l.total_ttc, 0);
  return { lines, total_ht, total_ttc };
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  total_ht: 0,
  total_ttc: 0,
  addLine: (line) =>
    set((s) => {
      const idx = s.lines.findIndex((l) => l.article_id === line.article_id);
      if (idx >= 0) {
        const updated = [...s.lines];
        const existing = updated[idx];
        const qty = existing.quantity + line.quantity;
        updated[idx] = {
          ...existing,
          quantity: qty,
          total_ht: +(qty * existing.unit_price).toFixed(3),
          total_ttc: +(qty * existing.unit_price * (1 + existing.tax_rate / 100)).toFixed(3),
        };
        return recalc(updated);
      }
      return recalc([...s.lines, line]);
    }),
  updateQuantity: (index, qty) =>
    set((s) => {
      if (qty <= 0) return recalc(s.lines.filter((_, i) => i !== index));
      const updated = [...s.lines];
      updated[index] = {
        ...updated[index],
        quantity: qty,
        total_ht: +(qty * updated[index].unit_price).toFixed(3),
        total_ttc: +(qty * updated[index].unit_price * (1 + updated[index].tax_rate / 100)).toFixed(3),
      };
      return recalc(updated);
    }),
  removeLine: (index) => set((s) => recalc(s.lines.filter((_, i) => i !== index))),
  clearCart: () => set({ lines: [], total_ht: 0, total_ttc: 0 }),
}));
