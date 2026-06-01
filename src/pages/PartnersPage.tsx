import { useState, useEffect } from "react";
import { listPartners, searchPartners, createPartner } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Partner, CreatePartner } from "../types";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filterType, setFilterType] = useState("");
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePartner>({
    partner_type: "client", code: "", name: "",
    address: "", phone: "", email: "", tax_id: "", credit_limit: 0, notes: "",
  });
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { load(); }, [filterType]);

  async function load() {
    try {
      const data = q
        ? await searchPartners(q)
        : await listPartners(filterType || undefined);
      setPartners(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  async function save() {
    try {
      await createPartner(form);
      addToast("Tiers créé", "success");
      setShowForm(false);
      setForm({ partner_type: "client", code: "", name: "", address: "", phone: "", email: "", tax_id: "", credit_limit: 0, notes: "" });
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Clients et fournisseurs</h1>
      <div className="flex gap-2 mb-4">
        {["", "client", "supplier"].map((t) => (
          <button key={t}
            onClick={() => setFilterType(t)}
            className={`touch-button px-4 h-10 rounded-lg border font-medium text-sm ${
              filterType === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            }`}>{t === "" ? "Tous" : t === "client" ? "Clients" : "Fournisseurs"}</button>
        ))}
        <div className="flex-1" />
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") load(); }}
          placeholder="Rechercher..."
          className="h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 w-48" />
        <button onClick={load} className="touch-button px-3 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 font-medium text-sm">OK</button>
        <button onClick={() => setShowForm(true)}
          className="touch-button px-4 h-10 rounded-lg bg-blue-600 text-white font-medium">+ Nouveau</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {partners.length === 0 && <p className="text-slate-400 text-center mt-8">Aucun tiers</p>}
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b">
            <th className="pb-2">Code</th><th className="pb-2">Nom</th><th className="pb-2">Téléphone</th>
            <th className="pb-2">Type</th><th className="pb-2 text-right">Solde</th>
          </tr></thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-2">{p.code}</td>
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2 text-slate-500">{p.phone || "—"}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.partner_type === "client" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {p.partner_type === "client" ? "Client" : "Fournisseur"}
                  </span>
                </td>
                <td className="py-2 text-right">{(p.balance / 1000).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nouveau tiers</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, partner_type: "client" })}
                  className={`touch-button flex-1 h-10 rounded-lg font-medium text-sm border ${form.partner_type === "client" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-700 border-slate-300"}`}>Client</button>
                <button onClick={() => setForm({ ...form, partner_type: "supplier" })}
                  className={`touch-button flex-1 h-10 rounded-lg font-medium text-sm border ${form.partner_type === "supplier" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-700 border-slate-300"}`}>Fournisseur</button>
              </div>
              {(["code", "name", "address", "phone", "email", "tax_id"] as const).map((f) => (
                <input key={f} type="text" placeholder={f}
                  value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
              ))}
              <input type="number" placeholder="Plafond crédit (millimes)"
                value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: parseInt(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)}
                className="touch-button flex-1 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 font-medium">Annuler</button>
              <button onClick={save}
                className="touch-button flex-1 h-10 rounded-xl bg-blue-600 text-white font-medium">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
