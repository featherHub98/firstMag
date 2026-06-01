import { useState } from "react";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";

const USERS = [
  { code: "1", name: "Admin", pin: "1234", role: "admin" },
  { code: "2", name: "Caissier", pin: "0000", role: "cashier" },
];

export default function LoginModal() {
  const loginOpen = useUiStore((s) => s.loginOpen);
  const setLoginOpen = useUiStore((s) => s.setLoginOpen);
  const setUser = useSessionStore((s) => s.setUser);
  const currentUser = useSessionStore((s) => s.currentUserName);
  const addToast = useToastStore((s) => s.addToast);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");

  function handleLogin() {
    const user = USERS.find((u) => u.code === code && u.pin === pin);
    if (user) {
      setUser(user.code, user.name);
      setLoginOpen(false);
      addToast(`Connecté: ${user.name}`, "success");
    } else {
      addToast("Code ou PIN incorrect", "error");
    }
  }

  function handleLogout() {
    setUser("", "Invité");
    setLoginOpen(true);
    addToast("Déconnecté", "info");
  }

  if (currentUser !== "Invité" && !loginOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-xs mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-center mb-4">FIRST MAG</h2>
        <p className="text-center text-sm text-slate-500 mb-4">Connectez-vous pour commencer</p>

        {currentUser === "Invité" ? (
          <div className="space-y-3">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Code utilisateur"
              className="w-full h-12 rounded-xl px-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-center text-lg" />
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)}
              placeholder="Code PIN"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full h-12 rounded-xl px-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-center text-lg" />
            <button onClick={handleLogin}
              className="touch-button w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-lg">Connexion</button>
            <p className="text-xs text-center text-slate-400">Admin: 1/1234 &middot; Caissier: 2/0000</p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-lg font-medium">{currentUser}</p>
            <button onClick={handleLogout}
              className="touch-button w-full h-12 rounded-xl bg-red-600 text-white font-bold">Déconnexion</button>
          </div>
        )}
      </div>
    </div>
  );
}
