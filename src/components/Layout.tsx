import { Outlet, NavLink } from "react-router-dom";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import StatusBar from "./StatusBar";
import LoginModal from "./LoginModal";

const navItems = [
  { to: "/pos", label: "Caisse", icon: "💳" },
  { to: "/sales", label: "Ventes", icon: "📄" },
  { to: "/stock", label: "Stock", icon: "📦" },
  { to: "/articles", label: "Articles", icon: "🏷️" },
  { to: "/partners", label: "Tiers", icon: "👥" },
  { to: "/reports", label: "États", icon: "📊" },
  { to: "/settings", label: "Config", icon: "⚙️" },
];

export default function Layout() {
  const darkMode = useUiStore((s) => s.darkMode);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setLoginOpen = useUiStore((s) => s.setLoginOpen);
  const userName = useSessionStore((s) => s.currentUserName);

  return (
    <div className={`h-full flex ${darkMode ? "dark" : ""}`}>
      <LoginModal />

      {sidebarOpen && (
        <nav className="w-20 lg:w-56 bg-slate-900 text-white flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 text-center lg:text-left font-bold text-lg border-b border-slate-700">
            <span className="hidden lg:inline">FIRST MAG</span>
            <span className="lg:hidden">FM</span>
          </div>
          <div className="flex-1 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-colors touch-button ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="p-3 border-t border-slate-700 space-y-1">
            <button onClick={() => setLoginOpen(true)}
              className="w-full text-xs text-slate-400 hover:text-white touch-button">
              👤 {userName}
            </button>
            <button onClick={toggleDarkMode}
              className="w-full text-xs text-slate-400 hover:text-white touch-button">
              {darkMode ? "☀️ Clair" : "🌙 Sombre"}
            </button>
          </div>
        </nav>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 shrink-0">
          <button onClick={toggleSidebar} className="text-xl touch-button p-1">☰</button>
          <div className="flex-1" />
          <button onClick={() => setLoginOpen(true)}
            className="text-sm text-slate-500 dark:text-slate-400 touch-button">{userName}</button>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          <Outlet />
        </main>

        <StatusBar />
      </div>
    </div>
  );
}
