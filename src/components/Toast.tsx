import { useToastStore } from "../api/toastStore";

const bgMap = { success: "bg-green-600", error: "bg-red-600", info: "bg-blue-600" };

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${bgMap[t.type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-up`}
        >
          <span className="flex-1 text-sm">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>
      ))}
    </div>
  );
}
