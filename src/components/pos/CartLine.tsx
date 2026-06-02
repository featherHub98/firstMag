import { Plus, Minus, Trash2, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtDinars } from "@/lib/format";

interface CartLineProps {
  name: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number; // in millimes
  totalTtc: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartLine({ name, unitPrice, quantity, discountPercent, discountAmount, totalTtc, onIncrement, onDecrement, onRemove }: CartLineProps) {
  const discountAmountInDinars = discountAmount / 1000;
  
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 group hover:bg-muted/70 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {fmtDinars(unitPrice)} × {quantity}
        </p>
        {(discountPercent > 0 || discountAmount > 0) && (
          <p className="text-xs text-muted-foreground">
            {(discountPercent > 0 && <span>-{discountPercent}%</span>)}
            {(discountPercent > 0 && discountAmount > 0 && " + ")}
            {(discountAmount > 0 && <span> -{fmtDinars(discountAmountInDinars)}</span>)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="size-7" onClick={onDecrement}>
          <Minus className="size-3.5" />
        </Button>
        <span className="w-7 text-center text-sm font-bold tabular-nums">{quantity}</span>
        <Button variant="outline" size="icon" className="size-7" onClick={onIncrement}>
          <Plus className="size-3.5" />
        </Button>
      </div>
      <span className="w-20 text-right text-sm font-bold tabular-nums">{fmtDinars(totalTtc)}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
