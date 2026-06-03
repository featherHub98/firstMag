import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import type { ReactElement } from "react";
import Layout from "./components/Layout";
import { useSessionStore } from "./stores/sessionStore";
import DashboardPage from "./pages/DashboardPage";
import PosPage from "./pages/PosPage";
import SalesPage from "./pages/SalesPage";
import StockPage from "./pages/StockPage";
import ArticlesPage from "./pages/ArticlesPage";
import PartnersPage from "./pages/PartnersPage";
import CrmPage from "./pages/CrmPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

function ProtectedRoute({
  permission,
  element,
}: {
  permission: string;
  element: ReactElement;
}) {
  const hasPermission = useSessionStore((s) => s.hasPermission);
  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute permission="dashboard" element={<DashboardPage />} />} />
            <Route path="/pos" element={<ProtectedRoute permission="pos" element={<PosPage />} />} />
            <Route path="/sales" element={<ProtectedRoute permission="sales" element={<SalesPage />} />} />
            <Route path="/stock" element={<ProtectedRoute permission="stock" element={<StockPage />} />} />
            <Route path="/articles" element={<ProtectedRoute permission="articles" element={<ArticlesPage />} />} />
            <Route path="/partners" element={<ProtectedRoute permission="partners" element={<PartnersPage />} />} />
            <Route path="/crm" element={<ProtectedRoute permission="partners" element={<CrmPage />} />} />
            <Route path="/reports" element={<ProtectedRoute permission="reports" element={<ReportsPage />} />} />
            <Route path="/settings" element={<ProtectedRoute permission="settings" element={<SettingsPage />} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
