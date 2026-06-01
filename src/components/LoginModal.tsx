import * as React from "react";
import { LogOut, Delete, Receipt } from "lucide-react";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const USERS = [
  { code: "1", name: "Admin", pin: "1234", role: "Admin" },
  { code: "2", name: "Caissier", pin: "0000", role: "Caissier" },
];

export default function LoginModal() {
  const loginOpen = useUiStore((s) => s.loginOpen);
  const setLoginOpen = useUiStore((s) => s.setLoginOpen);
  const setUser = useSessionStore((s) => s.setUser);
  const currentUser = useSessionStore((s) => s.currentUserName);
  const addToast = useToastStore((s) => s.addToast);
  const [pin, setPin] = React.useState("");

  React.useEffect(() => {
    if (currentUser === "Invité") setPin("");
  }, [currentUser, loginOpen]);

  function press(k: string) {
    if (pin.length >= 4) return;
    if (k === "back") setPin((p) => p.slice(0, -1));
    else if (k === "clear") setPin("");
    else setPin((p) => p + k);
  }

  function handleLogin(code: string) {
    const user = USERS.find((u) => u.code === code);
    if (user && user.pin === pin) {
      setUser(user.code, user.name);
      setLoginOpen(false);
      setPin("");
      addToast(`Connecté: ${user.name}`, "success");
    } else {
      addToast("Code PIN incorrect", "error");
      setPin("");
    }
  }

  function handleLogout() {
    setUser("", "Invité");
    setLoginOpen(true);
    addToast("Déconnecté", "info");
  }

  const open = currentUser === "Invité" || loginOpen;

  return (
    <Dialog open={open} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-sm p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
        {currentUser === "Invité" ? (
          <div className="p-6 space-y-5">
            <DialogHeader className="items-center text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto">
                <Receipt className="size-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl">FIRST MAG</DialogTitle>
                <DialogDescription>Connectez-vous pour commencer</DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 h-12">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`size-3 rounded-full transition-all ${i < pin.length ? "bg-primary scale-110" : "bg-muted"}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
                  <Button
                    key={k}
                    variant="outline"
                    className="h-14 text-xl font-semibold"
                    onClick={() => press(k)}
                  >
                    {k}
                  </Button>
                ))}
                <Button variant="ghost" className="h-14" onClick={() => setPin("")}>
                  C
                </Button>
                <Button variant="outline" className="h-14 text-xl font-semibold" onClick={() => press("0")}>
                  0
                </Button>
                <Button variant="ghost" className="h-14" onClick={() => press("back")}>
                  <Delete className="size-5" />
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t">
                {USERS.map((u) => (
                  <Button
                    key={u.code}
                    variant="secondary"
                    onClick={() => handleLogin(u.code)}
                    disabled={pin.length < 1}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">{u.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {u.name}
                    </span>
                    <Badge variant="outline">{u.role}</Badge>
                  </Button>
                ))}
              </div>
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
                <DialogDescription>Connecté</DialogDescription>
              </div>
            </DialogHeader>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="size-4" />
              Déconnexion
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
