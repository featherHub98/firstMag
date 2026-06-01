import { useSessionStore } from "../stores/sessionStore";
import { Separator } from "@/components/ui/separator";
import { CircleDot } from "lucide-react";

export default function StatusBar() {
  const registerOpen = useSessionStore((s) => s.registerOpen);
  const sessionId = useSessionStore((s) => s.sessionId);
  const userName = useSessionStore((s) => s.currentUserName);

  return (
    <footer className="flex h-7 shrink-0 items-center gap-3 border-t bg-muted/40 px-3 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <CircleDot className={`size-3 ${registerOpen ? "text-emerald-500" : "text-rose-500"}`} />
        Caisse {registerOpen ? "ouverte" : "fermée"}
      </span>
      {sessionId && (
        <>
          <Separator orientation="vertical" className="h-3" />
          <span className="font-mono">Session #{sessionId.slice(0, 8)}</span>
        </>
      )}
      <span className="flex-1" />
      <span>{userName}</span>
    </footer>
  );
}
