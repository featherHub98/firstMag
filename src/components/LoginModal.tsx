import * as React from "react";
import { Delete, LogOut, Receipt } from "lucide-react";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";
import { loginUser } from "../api/userApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LoginModal() {
  const loginOpen = useUiStore((s) => s.loginOpen);
  const setLoginOpen = useUiStore((s) => s.setLoginOpen);
  const setUser = useSessionStore((s) => s.setUser);
  const currentUser = useSessionStore((s) => s.currentUserName);
  const addToast = useToastStore((s) => s.addToast);
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (currentUser === "Invite") setCode("");
  }, [currentUser, loginOpen]);

  function press(k: string) {
    if (k === "back") {
      setCode((p) => p.slice(0, -1));
      return;
    }
    if (k === "clear") {
      setCode("");
      return;
    }
    if (code.length >= 4) return;
    setCode((p) => p + k);
  }

  async function handleLogin() {
    setBusy(true);
    try {
      const user = await loginUser(code);
      setUser(user.id, user.name, user.role, user.permissions);
      setLoginOpen(false);
      setCode("");
      addToast(`Connecte: ${user.name}`, "success");
    } catch {
      addToast("Code PIN incorrect", "error");
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    setUser("", "Invite", "guest", []);
    setLoginOpen(true);
    addToast("Deconnecte", "info");
  }

  const open = currentUser === "Invite" || loginOpen;

  React.useEffect(() => {
    if (!open || currentUser !== "Invite") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (busy) return;
      const key = event.key;

      if (key >= "0" && key <= "9") {
        event.preventDefault();
        press(key);
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        press("back");
        return;
      }

      if (key === "Delete") {
        event.preventDefault();
        press("clear");
        return;
      }

      if (key === "Enter" && code.length > 0) {
        event.preventDefault();
        void handleLogin();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, currentUser, busy, code]);

  return (
    <Dialog open={open} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-sm p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
        {currentUser === "Invite" ? (
          <div className="p-6 space-y-5">
            <DialogHeader className="items-center text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto">
                <Receipt className="size-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl">FIRST MAG</DialogTitle>
                <DialogDescription>Entrez votre code pour commencer</DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 h-12">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`size-3 rounded-full transition-all ${i < code.length ? "bg-primary scale-110" : "bg-muted"}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
                  <Button key={k} variant="outline" className="h-14 text-xl font-semibold" onClick={() => press(k)}>
                    {k}
                  </Button>
                ))}
                <Button variant="ghost" className="h-14" onClick={() => setCode("")}>
                  C
                </Button>
                <Button variant="outline" className="h-14 text-xl font-semibold" onClick={() => press("0")}>
                  0
                </Button>
                <Button variant="ghost" className="h-14" onClick={() => press("back")}>
                  <Delete className="size-5" />
                </Button>
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                disabled={code.length < 1 || busy}
                onClick={() => void handleLogin()}
              >
                {busy ? "Connexion..." : "Entrer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <DialogHeader className="items-center space-y-3">
              <Avatar className="size-16 mx-auto">
                <AvatarFallback className="text-xl">{currentUser.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>{currentUser}</DialogTitle>
                <DialogDescription>Connecte</DialogDescription>
              </div>
            </DialogHeader>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="size-4" />
              Deconnexion
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
