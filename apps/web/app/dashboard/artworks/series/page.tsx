"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

interface SeriesRow {
  id: string;
  title: string;
  description: string | null;
  artwork_count: number;
  is_visible: boolean;
  created_at: string;
}

export default function SeriesPage() {
  const { artistProfile } = useAuth();
  const [series, setSeries] = useState<SeriesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (!artistProfile) return;
    loadSeries();
  }, [artistProfile]);

  async function loadSeries() {
    if (!artistProfile) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("artwork_series")
      .select("*")
      .eq("artist_id", artistProfile.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Impossible de charger les séries : " + error.message);
    }
    setSeries((data as SeriesRow[]) || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!artistProfile) return;
    setTitleError("");
    if (!title.trim()) {
      setTitleError("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    if (editId) {
      const { error } = await supabase
        .from("artwork_series")
        .update({ title, description: description || null })
        .eq("id", editId);
      if (error) {
        toast.error("Erreur lors de la mise à jour : " + error.message);
        setSaving(false);
        return;
      }
      toast.success("Série mise à jour !");
    } else {
      const { error } = await supabase.from("artwork_series").insert({
        artist_id: artistProfile.id,
        title,
        description: description || null,
      });
      if (error) {
        toast.error("Erreur lors de la création : " + error.message);
        setSaving(false);
        return;
      }
      toast.success("Série créée !");
    }

    setTitle("");
    setDescription("");
    setEditId(null);
    setShowForm(false);
    setSaving(false);
    await loadSeries();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette série ? Les œuvres ne seront pas supprimées.")) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("artwork_series").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression : " + error.message);
      return;
    }
    toast.success("Série supprimée");
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }

  function startEdit(s: SeriesRow) {
    setEditId(s.id);
    setTitle(s.title);
    setDescription(s.description || "");
    setShowForm(true);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Séries</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setTitle(""); setDescription(""); setTitleError(""); }}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          {showForm ? "Annuler" : "Nouvelle série"}
        </button>
      </div>

      {showForm && (
        <div className="mt-6 max-w-lg rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <button onClick={handleSave} disabled={saving || !title.trim()} className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
            {saving ? "..." : editId ? "Enregistrer" : "Créer"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : series.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucune série. Créez-en une pour regrouper vos œuvres.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {series.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">{s.title}</h3>
                {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
                <p className="text-xs text-gray-400">{s.artwork_count} œuvre{s.artwork_count !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="rounded px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200">Modifier</button>
                <button onClick={() => handleDelete(s.id)} className="rounded px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
