import * as React from "react";
import { Banknote } from "lucide-react";
import { listCashiers, listRegisters } from "../../api";
import { closeSession, getOpenSession, openSession } from "../../api/posApi";
import { useToastStore } from "../../api/toastStore";
import { useSessionStore } from "../../stores/sessionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RegisterOpening() {
  const { registerOpen, sessionId, setRegisterOpen, openingFund, currentUserId } = useSessionStore();
  const [showDialog, setShowDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<{ amount: number }>({
    amount: openingFund / 1000,
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshSession() {
    try {
      const session = await getOpenSession();
      if (session && session.status === "open") {
        setRegisterOpen(true, session.id, session.opening_fund);
      } else {
        setRegisterOpen(false, undefined, 0);
      }
    } catch {
      // Keep existing UI state if call fails.
    }
  }

  function openRegisterDialog() {
    setForm({ amount: openingFund / 1000 });
    setShowDialog(true);
  }

  async function handleCloseRegister() {
    setLoading(true);
    try {
      const existing = sessionId ? { id: sessionId } : await getOpenSession();
      if (!existing) {
        setRegisterOpen(false, undefined, 0);
        addToast("Aucune session ouverte", "info");
        return;
      }
      await closeSession(existing.id, openingFund);
      setRegisterOpen(false, undefined, 0);
      addToast("Caisse fermee", "info");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenRegister() {
    setLoading(true);
    try {
      const amountInMillimes = Math.round(form.amount * 1000);
      const [cashierRows, registerRows] = await Promise.all([listCashiers(), listRegisters()]);
      const activeCashier = cashierRows.find((c) => c.active) ?? cashierRows[0];
      const activeRegister = registerRows.find((r) => r.active) ?? registerRows[0];
      const resolvedCashierId = activeCashier?.id ?? currentUserId ?? "1";
      const resolvedRegisterId = activeRegister?.id ?? "1";

      const session = await openSession(resolvedCashierId, amountInMillimes, resolvedRegisterId);
      setRegisterOpen(true, session.id, session.opening_fund);
      addToast(`Caisse ouverte avec un fonds de ${form.amount.toFixed(3)} D`, "success");
      setShowDialog(false);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={registerOpen ? () => void handleCloseRegister() : openRegisterDialog}
        variant="outline"
        size="icon"
        disabled={loading}
        className="tooltip"
      >
        <Banknote className={`size-4 ${registerOpen ? "text-green-600" : ""}`} />
        <div className="tooltip-content">{registerOpen ? "Fermer la caisse" : "Ouvrir la caisse"}</div>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ouverture de caisse</DialogTitle>
            <DialogDescription>Entrez le fonds de caisse initial pour cette session.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="openingFund">Fonds de caisse initial (D)</Label>
              <Input
                id="openingFund"
                type="number"
                step="0.001"
                value={form.amount}
                onChange={(e) => setForm({ amount: Number(e.target.value) || 0 })}
                placeholder="0.000"
                className="text-right"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => void handleOpenRegister()} disabled={loading}>
              {loading ? "Ouverture..." : "Ouvrir la caisse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
