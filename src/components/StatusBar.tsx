import { useSessionStore } from "../stores/sessionStore";

export default function StatusBar() {
  const registerOpen = useSessionStore((s) => s.registerOpen);
  const sessionId = useSessionStore((s) => s.sessionId);
  const userName = useSessionStore((s) => s.currentUserName);

  return (
    <footer className="h-8 bg-slate-800 text-white text-xs flex items-center px-4 gap-4 shrink-0">
      <span className="flex items-center gap-1">
        <span
          className={`w-2 h-2 rounded-full ${
            registerOpen ? "bg-green-400" : "bg-red-400"
          }`}
        />
        Caisse {registerOpen ? "ouverte" : "fermée"}
      </span>
      {sessionId && <span>Session #{sessionId.slice(0, 8)}</span>}
      <span className="flex-1" />
      <span>{userName}</span>
    </footer>
  );
}
