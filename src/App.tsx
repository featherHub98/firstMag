import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import PosPage from "./pages/PosPage";
import SalesPage from "./pages/SalesPage";
import StockPage from "./pages/StockPage";
import ArticlesPage from "./pages/ArticlesPage";
import PartnersPage from "./pages/PartnersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}
