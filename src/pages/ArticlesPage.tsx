import { useState, useEffect } from "react";
import { listArticles, searchArticles, createArticle, updateArticle, deleteArticle, fmtDinars } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Article, CreateArticle } from "../types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateArticle>({
    code: "", barcode: "", name: "", unit: "pcs",
    purchase_price: 0, sale_price: 0,
  });
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = q ? await searchArticles(q) : await listArticles();
      setArticles(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  function openNew() {
    setEditId(null);
    setForm({ code: "", barcode: "", name: "", unit: "pcs", purchase_price: 0, sale_price: 0 });
    setShowForm(true);
  }

  function openEdit(a: Article) {
    setEditId(a.id);
    setForm({
      code: a.code, barcode: a.barcode, name: a.name, unit: a.unit,
      purchase_price: a.purchase_price, sale_price: a.sale_price,
      family_id: a.family_id, sub_family_id: a.sub_family_id, tax_rate_id: a.tax_rate_id,
    });
    setShowForm(true);
  }

  async function save() {
    try {
      if (editId) {
        await updateArticle({ id: editId, ...form });
        addToast("Article modifié", "success");
      } else {
        await createArticle(form);
        addToast("Article créé", "success");
      }
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    try {
      await deleteArticle(id);
      addToast("Article supprimé", "success");
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Catalogue articles</h1>
      <div className="flex gap-2 mb-4">
        <input type="text" value={q} onChange={(e) => { setQ(e.target.value); }}
          onKeyDown={(e) => { if (e.key === "Enter") load(); }}
          placeholder="Rechercher un article..."
          className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" />
        <button onClick={load} className="touch-button px-4 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 font-medium">OK</button>
        <button onClick={openNew} className="touch-button px-4 h-10 rounded-lg bg-blue-600 text-white font-medium">+ Nouveau</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 && <p className="text-slate-400 text-center mt-8">Aucun article</p>}
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b">
            <th className="pb-2">Code</th><th className="pb-2">Nom</th><th className="pb-2">Code-barres</th>
            <th className="pb-2 text-right">Prix achat</th><th className="pb-2 text-right">Prix vente</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="py-2">{a.code}</td>
                <td className="py-2 font-medium">{a.name}</td>
                <td className="py-2 text-slate-500">{a.barcode || "—"}</td>
                <td className="py-2 text-right">{fmtDinars(a.purchase_price)}</td>
                <td className="py-2 text-right font-bold">{fmtDinars(a.sale_price)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline text-xs mr-2">Modifier</button>
                  <button onClick={() => del(a.id, a.name)} className="text-red-600 hover:underline text-xs">Suppr.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? "Modifier" : "Nouvel"} article</h3>
            <div className="space-y-3">
              {[
                ["Code", "code"], ["Code-barres", "barcode"], ["Nom", "name"],
              ].map(([label, key]) => (
                <input key={key} type="text" placeholder={label}
                  value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
              ))}
              <div className="flex gap-2">
                <input type="number" placeholder="Prix achat (millimes)"
                  value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: parseInt(e.target.value) || 0 })}
                  className="flex-1 h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
                <input type="number" placeholder="Prix vente (millimes)"
                  value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: parseInt(e.target.value) || 0 })}
                  className="flex-1 h-10 rounded-lg px-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
              </div>
              <input type="text" placeholder="Unité"
                value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
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
