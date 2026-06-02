import * as React from "react";
import { Banknote, CheckCircle, Plus, Settings } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { useToastStore } from "../../api/toastStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  Description,
  Footer,
  Header,
  Title,
} from "@/components/ui/dialog";

export default function RegisterOpening() {
  const { registerOpen, setRegisterOpen, openingFund, setOpeningFund } = useSessionStore();
  const [showDialog, setShowDialog] = React.useState(false);
  const [form, setForm] = React.useState<{ amount: number }>({
    amount: openingFund / 1000, // Convert from millimes to Dinars for display
  });
  const addToast = useToastStore((s) => s.addToast);

  const openRegister = () => {
    setForm({ amount: openingFund / 1000 });
    setShowDialog(true);
  };

  const closeRegister = () => {
    setRegisterOpen(false, null, 0);
    addToast("Caisse fermée", "info");
  };

  const handleSave = () => {
    const amountInMillimes = Math.round(form.amount * 1000);
    setRegisterOpen(true, `session_${Date.now()}`, amountInMillimes);
    addToast(`Caisse ouverte avec un fonds de ${form.amount} D`, "success");
    setShowDialog(false);
  };

  if (!registerOpen) {
    return (
      <Button onClick={openRegister} variant="outline" size="icon" className="tooltip">
        <Banknote className="size-4" />
        <div className="tooltip-content">Ouvrir la caisse</div>
      </Button>
    );
  }

  return (
    <>
      <Button onClick={closeRegister} variant="outline" size="icon" className="tooltip">
        <Banknote className="size-4 text-green-600" />
        <div className="tooltip-content">Fermer la caisse</div>
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ouverture de caisse</DialogTitle>
            <DialogDescription>
              Entrez le fonds de caisse initial pour cette session.
            </DialogDescription>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="openingFund">Fonds de caisse initial (D)</Label>
                <Input
                  id="openingFund"
                  type="number"
                  step="0.001"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
                  placeholder="0.000"
                  className="text-right"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Fonds actuel: {openingFund / 1000} D
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Ouvrir la caisse</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}