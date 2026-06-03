import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { addCashMovement, getSessionCashSummary, listCashMovements } from "../../api/posApi";
import { useToastStore } from "../../api/toastStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { CashMovement, CashMovementSummary, CashMovementType } from "../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CashMovementJournalProps {
  onClose: () => void;
}

const emptySummary: CashMovementSummary = {
  opening_fund: 0,
  total_in: 0,
  total_out: 0,
  current_cash: 0,
};

export function CashMovementJournal({ onClose }: CashMovementJournalProps) {
  const { sessionId, registerOpen, currentUserId, currentUserName } = useSessionStore((s) => ({
    sessionId: s.sessionId,
    registerOpen: s.registerOpen,
    currentUserId: s.currentUserId,
    currentUserName: s.currentUserName,
  }));
  const addToast = useToastStore((s) => s.addToast);

  const [movements, setMovements] = React.useState<CashMovement[]>([]);
  const [summary, setSummary] = React.useState<CashMovementSummary>(emptySummary);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showAddMovement, setShowAddMovement] = React.useState(false);
  const [movementType, setMovementType] = React.useState<CashMovementType>("out");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");

  const reloadData = React.useCallback(async () => {
    if (!sessionId) {
      setMovements([]);
      setSummary(emptySummary);
      return;
    }

    setLoading(true);
    try {
      const [rows, totals] = await Promise.all([
        listCashMovements(sessionId),
        getSessionCashSummary(sessionId),
      ]);
      setMovements(rows);
      setSummary(totals);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, sessionId]);

  React.useEffect(() => {
    void reloadData();
  }, [reloadData]);

  async function handleAddMovement() {
    if (!registerOpen) {
      addToast("La caisse doit etre ouverte", "error");
      return;
    }
    if (!sessionId) {
      addToast("Session introuvable", "error");
      return;
    }

    const amountInMillimes = Math.round((Number(amount) || 0) * 1000);
    if (amountInMillimes <= 0) {
      addToast("Montant invalide", "error");
      return;
    }

    setSaving(true);
    try {
      await addCashMovement({
        session_id: sessionId,
        movement_type: movementType,
        amount: amountInMillimes,
        description: description.trim(),
        user_id: currentUserId || "1",
        user_name: currentUserName || "Operateur",
      });
      setAmount("");
      setDescription("");
      setShowAddMovement(false);
      await reloadData();
      addToast("Mouvement enregistre", "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Journal des mouvements de caisse</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Situation actuelle</h3>
              <span className="text-lg font-bold">
                {summary.current_cash >= 0 ? "+" : ""}
                {(summary.current_cash / 1000).toFixed(3)} D
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Fond de caisse initial</p>
                <p className="font-mono tabular-nums">{(summary.opening_fund / 1000).toFixed(3)} D</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entrees</p>
                <p className="font-mono tabular-nums text-sm text-green-600">
                  {(summary.total_in / 1000).toFixed(3)} D
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sorties</p>
                <p className="font-mono tabular-nums text-sm text-red-600">
                  {(summary.total_out / 1000).toFixed(3)} D
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Solde en caisse</p>
                <p className="font-mono tabular-nums text-lg font-bold">
                  {summary.current_cash >= 0 ? "+" : ""}
                  {(summary.current_cash / 1000).toFixed(3)} D
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Mouvements</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddMovement(true)} disabled={!registerOpen}>
                + Nouveau mouvement
              </Button>
            </div>

            {showAddMovement && (
              <div className="mb-4 grid gap-3 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={movementType === "out" ? "default" : "outline"}
                    onClick={() => setMovementType("out")}
                  >
                    Sortie
                  </Button>
                  <Button
                    type="button"
                    variant={movementType === "in" ? "default" : "outline"}
                    onClick={() => setMovementType("in")}
                  >
                    Entree
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="movement-amount">Montant (D)</Label>
                  <Input
                    id="movement-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    placeholder="0.000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="movement-desc">Description</Label>
                  <Input
                    id="movement-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Motif du mouvement"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddMovement(false)}>
                    Annuler
                  </Button>
                  <Button type="button" onClick={() => void handleAddMovement()} disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Aucun mouvement enregistre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{movement.description || "(Sans description)"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.created_at).toLocaleString()} - {movement.user_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={movement.movement_type === "in" ? "outline" : "destructive"}>
                        {movement.movement_type === "in" ? "ENTREE" : "SORTIE"}
                      </Badge>
                      <span className="w-20 text-right text-sm font-bold tabular-nums">
                        {movement.movement_type === "in" ? "+" : "-"}
                        {(movement.amount / 1000).toFixed(3)} D
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
