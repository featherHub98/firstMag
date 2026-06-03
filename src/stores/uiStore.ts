import { create } from "zustand";

function loadDark(): boolean {
  try { return localStorage.getItem("firstmag-dark") === "true"; }
  catch { return false; }
}

function saveDark(v: boolean) {
  try { localStorage.setItem("firstmag-dark", v ? "true" : "false"); } catch {}
}

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return value === "true";
  } catch {
    return fallback;
  }
}

function saveBool(key: string, value: boolean) {
  try { localStorage.setItem(key, value ? "true" : "false"); } catch {}
}

type UiDensity = "modern" | "classic";
type NavigationMode = "side" | "top";

function loadDensity(): UiDensity {
  try {
    return localStorage.getItem("firstmag-density") === "classic" ? "classic" : "modern";
  } catch {
    return "modern";
  }
}

function saveDensity(value: UiDensity) {
  try { localStorage.setItem("firstmag-density", value); } catch {}
}

function loadNavigationMode(): NavigationMode {
  try {
    return localStorage.getItem("firstmag-navigation-mode") === "top" ? "top" : "side";
  } catch {
    return "side";
  }
}

function saveNavigationMode(value: NavigationMode) {
  try { localStorage.setItem("firstmag-navigation-mode", value); } catch {}
}

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  loginOpen: boolean;
  legacyLabels: boolean;
  keyboardProfile: boolean;
  migrationTips: boolean;
  scannerFirstFocus: boolean;
  density: UiDensity;
  navigationMode: NavigationMode;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  toggleLegacyLabels: () => void;
  toggleKeyboardProfile: () => void;
  toggleMigrationTips: () => void;
  toggleScannerFirstFocus: () => void;
  setDensity: (density: UiDensity) => void;
  toggleNavigationMode: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  darkMode: loadDark(),
  sidebarOpen: window.innerWidth >= 1024,
  loginOpen: true,
  legacyLabels: loadBool("firstmag-legacy-labels", true),
  keyboardProfile: loadBool("firstmag-keyboard-profile", true),
  migrationTips: loadBool("firstmag-migration-tips", true),
  scannerFirstFocus: loadBool("firstmag-scanner-focus", true),
  density: loadDensity(),
  navigationMode: loadNavigationMode(),
  toggleDarkMode: () => set((s) => { const v = !s.darkMode; saveDark(v); return { darkMode: v }; }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoginOpen: (open) => set({ loginOpen: open }),
  toggleLegacyLabels: () => set((s) => {
    const next = !s.legacyLabels;
    saveBool("firstmag-legacy-labels", next);
    return { legacyLabels: next };
  }),
  toggleKeyboardProfile: () => set((s) => {
    const next = !s.keyboardProfile;
    saveBool("firstmag-keyboard-profile", next);
    return { keyboardProfile: next };
  }),
  toggleMigrationTips: () => set((s) => {
    const next = !s.migrationTips;
    saveBool("firstmag-migration-tips", next);
    return { migrationTips: next };
  }),
  toggleScannerFirstFocus: () => set((s) => {
    const next = !s.scannerFirstFocus;
    saveBool("firstmag-scanner-focus", next);
    return { scannerFirstFocus: next };
  }),
  setDensity: (density) => set(() => {
    saveDensity(density);
    return { density };
  }),
  toggleNavigationMode: () => set((s) => {
    const next: NavigationMode = s.navigationMode === "side" ? "top" : "side";
    saveNavigationMode(next);
    return { navigationMode: next };
  }),
}));
