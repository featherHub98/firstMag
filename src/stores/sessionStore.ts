import { create } from "zustand";

interface SessionState {
  currentUserId: string | null;
  currentUserName: string;
  currentUserRole: string;
  currentUserPermissions: string[];
  registerOpen: boolean;
  sessionId: string | null;
  openingFund: number;
  customerId: string | null;
  customerName: string | null;
  customerBalance: number;
  setUser: (id: string, name: string, role?: string, permissions?: string[]) => void;
  hasPermission: (permission: string) => boolean;
  setRegisterOpen: (open: boolean, sessionId?: string, openingFund?: number) => void;
  clear: () => void;
  setOpeningFund: (amount: number) => void;
  setCustomer: (id: string | null, name: string | null, balance: number) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentUserId: null,
  currentUserName: "Invite",
  currentUserRole: "guest",
  currentUserPermissions: [],
  registerOpen: false,
  sessionId: null,
  openingFund: 0,
  customerId: null,
  customerName: null,
  customerBalance: 0,
  setUser: (id, name, role = "guest", permissions = []) =>
    set({
      currentUserId: id,
      currentUserName: name,
      currentUserRole: role,
      currentUserPermissions: permissions,
    }),
  hasPermission: (permission: string): boolean => {
    const state = get();
    if (state.currentUserPermissions.includes("*")) return true;
    return state.currentUserPermissions.includes(permission);
  },
  setRegisterOpen: (open, sessionId, openingFund = 0) =>
    set({ registerOpen: open, sessionId: sessionId || null, openingFund }),
  clear: () =>
    set({
      currentUserId: null,
      currentUserName: "Invite",
      currentUserRole: "guest",
      currentUserPermissions: [],
      registerOpen: false,
      sessionId: null,
      openingFund: 0,
      customerId: null,
      customerName: null,
      customerBalance: 0,
    }),
  setOpeningFund: (amount) => set({ openingFund: amount }),
  setCustomer: (id, name, balance) =>
    set({ customerId: id, customerName: name, customerBalance: balance }),
}));
