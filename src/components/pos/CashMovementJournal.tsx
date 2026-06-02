import * as React from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CashMovement {
  id: string;
  type: "in" | "out";
  amount: number; // in millimes
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

interface CashMovementJournalProps {
  onClose: () => void;
}

export function CashMovementJournal({ onClose }: CashMovementJournalProps) {
  const { openingFund, setOpeningFund } = useSessionStore((s) => ({
    openingFund: s.openingFund,
    setOpeningFund: s.setOpeningFund
  }));
  const { currentUserId, currentUserName } = useSessionStore((s) => ({
    currentUserId: s.currentUserId,
    currentUserName: s.currentUserName
  }));

  const [movements, setMovements] = React.useState<CashMovement[]>([]);
  const [showAddMovement, setShowAddMovement] = React.useState(false);
  const [movementType, setMovementType] = React.useState<"in" | "out">("out");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Calculate current cash in register
  const calculateCurrentCash = () => {
    const totalIn = movements
      .filter(m => m.type === "in")
      .reduce((sum, m) => sum + m.amount, 0);
    
    const totalOut = movements
      .filter(m => m.type === "out")
      .reduce((sum, m) => sum + m.amount, 0);
    
    return openingFund + totalIn - totalOut;
  };

  const handleAddMovement = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const movement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: movementType,
      amount: parseFloat(amount) * 1000, // Convert to millimes
      description,
      timestamp: new Date().toISOString(),
      userId: currentUserId || "unknown",
      userName: currentUserName || "Unknown"
    };

    setMovements([...movements, movement]);
    setShowAddMovement(false);
    setAmount("");
    setDescription("");
  };

  const cashInRegister = calculateCurrentCash();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Journal des mouvements de caisse</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Situation actuelle</h3>
              <span className="text-lg font-bold">{cashInRegister >= 0 ? "+" : ""}{(cashInRegister / 1000).toFixed(3)} D</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Fond de caisse initial</p>
                <p className="font-mono tabular-nums">{(openingFund / 1000).toFixed(3)} D</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entrées</p>
                <p className="font-mono tabular-nums text-sm text-green-600">
                  {{
                    movements
                      .filter(m => m.type === "in")
                      .reduce((sum, m) => sum + m.amount, 0)
                  } / 1000}.3f D
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sorties</p>
                <p className="font-mono tabular-nums text-sm text-red-600">
                  {{
                    movements
                      .filter(m => m.type === "out")
                      .reduce((sum, m) => sum + m.amount, 0)
                  } / 1000}.3f D
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Solde en caisse</p>
                <p className="font-mono tabular-nums text-lg font-bold">
                  {cashInRegister >= 0 ? "+" : ""}{(cashInRegister / 1000).toFixed(3)} D
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Mouvements</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMovement(true)}
              >
                + Nouveau mouvement
              </Button>
            </div>
            
            {movements.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Aucun mouvement enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {movements
                  .slice()
                  .reverse()
                  .map((movement) => (
                    <div key={movement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{movement.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.timestamp).toLocaleString()} • 
                          {movement.userName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge 
                          variant={movement.type === "in" ? "outline" : "destructive"}
                        >
                          {movement.type === "in" ? "ENTREE" : "SORTIE"}
                        </Badge>
                        <span className="w-20 text-right text-sm font-bold tabular-nums">
                          {movement.type === "in" ? "+" : "-"}{(movement.amount / 1000).toFixed(3)} D
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