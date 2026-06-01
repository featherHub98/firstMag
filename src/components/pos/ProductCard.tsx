import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtDinars } from "@/lib/format";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  priceMillimes: number;
  stock?: number;
  imageUrl?: string;
  onClick: () => void;
  highlight?: boolean;
}

export function ProductCard({ name, priceMillimes, stock, imageUrl, onClick, highlight }: ProductCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer group hover:shadow-md hover:border-primary/40 transition-all overflow-hidden",
        highlight && "animate-flash border-emerald-500",
      )}
    >
      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Package className="size-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
        )}
        {stock !== undefined && (
          <Badge
            variant={stock > 0 ? "secondary" : "destructive"}
            className="absolute top-2 right-2 text-[10px] h-5"
          >
            {stock > 0 ? `Stock: ${stock}` : "Rupture"}
          </Badge>
        )}
      </div>
      <CardContent className="p-3 space-y-1">
        <p className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{name}</p>
        <p className="text-lg font-bold tabular-nums">{fmtDinars(priceMillimes)} <span className="text-xs text-muted-foreground">D</span></p>
      </CardContent>
    </Card>
  );
}
