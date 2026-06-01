import { Delete, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  allowDecimal?: boolean;
  maxLength?: number;
  className?: string;
}

export function NumericKeypad({
  value,
  onChange,
  onConfirm,
  onCancel,
  allowDecimal = true,
  maxLength = 12,
  className,
}: NumericKeypadProps) {
  function press(key: string) {
    if (value.length >= maxLength) return;
    if (key === ".") {
      if (!allowDecimal) return;
      if (value === "" || value === "0") onChange("0.");
      else if (!value.includes(".")) onChange(value + ".");
    } else if (key === "back") {
      onChange(value.slice(0, -1));
    } else if (key === "clear") {
      onChange("");
    } else {
      if (value === "0" && key !== ".") onChange(key);
      else onChange(value + key);
    }
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
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
      {allowDecimal && (
        <Button variant="outline" className="h-14 text-xl font-semibold" onClick={() => press(".")}>
          .
        </Button>
      )}
      <Button variant="outline" className="h-14 text-xl font-semibold" onClick={() => press("0")}>
        0
      </Button>
      <Button
        variant="outline"
        className="h-14 text-xl"
        onClick={() => press("back")}
      >
        <Delete className="size-5" />
      </Button>
      {onCancel && (
        <Button variant="ghost" className="col-span-1 h-12" onClick={onCancel}>
          <X className="size-4" />
          Effacer
        </Button>
      )}
      <Button variant="ghost" className="col-span-1 h-12" onClick={() => press("clear")}>
        C
      </Button>
      {onConfirm && (
        <Button variant="success" className="col-span-1 h-12" onClick={onConfirm}>
          <Check className="size-4" />
          OK
        </Button>
      )}
    </div>
  );
}
