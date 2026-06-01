import { create } from "zustand";

function loadDark(): boolean {
  try { return localStorage.getItem("firstmag-dark") === "true"; }
  catch { return false; }
}

function saveDark(v: boolean) {
  try { localStorage.setItem("firstmag-dark", v ? "true" : "false"); } catch {}
}

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  loginOpen: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  darkMode: loadDark(),
  sidebarOpen: window.innerWidth >= 1024,
  loginOpen: true,
  toggleDarkMode: () => set((s) => { const v = !s.darkMode; saveDark(v); return { darkMode: v }; }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoginOpen: (open) => set({ loginOpen: open }),
}));
