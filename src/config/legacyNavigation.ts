import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Package,
  Tag,
  Users,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";

export interface LegacyNavItem {
  to: string;
  label: string;
  legacyLabel: string;
  icon: LucideIcon;
  shortcuts: string[];
  permission: string;
}

export interface LegacyNavGroup {
  id: string;
  label: string;
  items: LegacyNavItem[];
}

export const legacyNavigationMap: LegacyNavGroup[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    items: [
      {
        to: "/dashboard",
        label: "TABLEAU DE BORD",
        legacyLabel: "TABLEAU DE BORD",
        icon: LayoutDashboard,
        shortcuts: ["F1"],
        permission: "dashboard",
      },
      {
        to: "/reports",
        label: "ETATS ET REQUETES",
        legacyLabel: "ETATS ET REQUETES",
        icon: BarChart3,
        shortcuts: ["F8"],
        permission: "reports",
      },
    ],
  },
  {
    id: "structure",
    label: "Structure",
    items: [
      {
        to: "/articles",
        label: "FICHIER ARTICLE",
        legacyLabel: "FICHIER ARTICLE",
        icon: Tag,
        shortcuts: ["F6"],
        permission: "articles",
      },
      {
        to: "/partners",
        label: "CLIENTS / FOURNISSEURS",
        legacyLabel: "CLIENTS / FOURNISSEURS",
        icon: Users,
        shortcuts: ["F7"],
        permission: "partners",
      },
      {
        to: "/settings",
        label: "PARAMETRAGE",
        legacyLabel: "PARAMETRAGE",
        icon: SettingsIcon,
        shortcuts: ["F9"],
        permission: "settings",
      },
    ],
  },
  {
    id: "processing",
    label: "Traitement",
    items: [
      {
        to: "/sales",
        label: "DOCUMENTS DES VENTES",
        legacyLabel: "DOCUMENTS DES VENTES",
        icon: FileText,
        shortcuts: ["F3"],
        permission: "sales",
      },
      {
        to: "/stock",
        label: "MOUVEMENTS DE STOCK",
        legacyLabel: "MOUVEMENTS DE STOCK",
        icon: Package,
        shortcuts: ["F4"],
        permission: "stock",
      },
      {
        to: "/crm",
        label: "SUIVI CLIENT / FIDELITE",
        legacyLabel: "SUIVI CLIENT / FIDELITE",
        icon: Users,
        shortcuts: ["F10"],
        permission: "partners",
      },
    ],
  },
  {
    id: "cash",
    label: "Caisse",
    items: [
      {
        to: "/pos",
        label: "VENTE COMPTOIR / CAISSE",
        legacyLabel: "VENTE COMPTOIR / CAISSE",
        icon: CreditCard,
        shortcuts: ["F2"],
        permission: "pos",
      },
    ],
  },
];

export const keyboardRouteMap: Record<string, string> = legacyNavigationMap
  .flatMap((group) => group.items)
  .reduce<Record<string, string>>((acc, item) => {
    for (const shortcut of item.shortcuts) {
      acc[shortcut] = item.to;
    }
    return acc;
  }, {});
