import { create } from "zustand";

interface SessionState {
  currentUserId: string | null;
  currentUserName: string;
  registerOpen: boolean;
  sessionId: string | null;
  openingFund: number; // In millimes (Tunisian currency subdivision)
  customerId: string | null;
  customerName: string | null;
  customerBalance: number; // In millimes (Tunisian currency subdivision)
  setUser: (id: string, name: string) => void;
  setRegisterOpen: (open: boolean, sessionId?: string, openingFund?: number) => void;
  clear: () => void;
  setOpeningFund: (amount: number) => void;
  setCustomer: (id: string | null, name: string | null, balance: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentUserId: null,
  currentUserName: "Invité",
  registerOpen: false,
  sessionId: null,
  openingFund: 0,
  customerId: null,
  customerName: null,
  customerBalance: 0,
  setUser: (id, name) => set({ currentUserId: id, currentUserName: name }),
  setRegisterOpen: (open, sessionId, openingFund = 0) =>
    set({ registerOpen: open, sessionId: sessionId || null, openingFund: openingFund }),
  clear: () =>
    set({
      currentUserId: null,
      currentUserName: "Invité",
      registerOpen: false,
      sessionId: null,
      openingFund: 0,
      customerId: null,
      customerName: null,
      customerBalance: 0,
    }),
  setOpeningFund: (amount) => set({ openingFund: amount }),
  setCustomer: (id, name, balance) => set({ customerId: id, customerName: name, customerBalance: balance }),
}));