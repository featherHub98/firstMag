import { create } from "zustand";

interface SessionState {
  currentUserId: string | null;
  currentUserName: string;
  registerOpen: boolean;
  sessionId: string | null;
  setUser: (id: string, name: string) => void;
  setRegisterOpen: (open: boolean, sessionId?: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentUserId: null,
  currentUserName: "Invité",
  registerOpen: false,
  sessionId: null,
  setUser: (id, name) => set({ currentUserId: id, currentUserName: name }),
  setRegisterOpen: (open, sessionId) =>
    set({ registerOpen: open, sessionId: sessionId || null }),
  clear: () =>
    set({
      currentUserId: null,
      currentUserName: "Invité",
      registerOpen: false,
      sessionId: null,
    }),
}));
