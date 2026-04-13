"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface LiveStreamRow {
  id: string;
  title: string;
  description: string | null;
  status: "scheduled" | "live" | "ended" | "canceled";
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  stream_key: string | null;
  rtmp_ingest_url: string | null;
  provider_playback_id: string | null;
  recording_url: string | null;
  created_at: string;
}

export default function DashboardLivePage() {
  const { user, artistProfile } = useAuth();
  const [streams, setStreams] = useState<LiveStreamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState<LiveStreamRow | null>(null);

  useEffect(() => {
    if (!artistProfile?.id) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("live_streams")
      .select("*")
      .eq("artist_id", artistProfile.id)
      .order("scheduled_at", { ascending: false, nullsFirst: false })
      .then(({ data, error }) => {
        if (error) toast.error("Impossible de charger les lives");
        setStreams((data as LiveStreamRow[]) ?? []);
        setLoading(false);
      });
  }, [artistProfile?.id]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || creating) return;
    setCreating(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/live-stream-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description: description || undefined,
            scheduled_at: scheduledAt || null,
          }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const payload = await res.json();
      const stream: LiveStreamRow = payload.stream;
      setStreams((prev) => [stream, ...prev]);
      setLastCreated(stream);
      setTitle("");
      setDescription("");
      setScheduledAt("");
      toast.success("Live programmé");
    } catch (err) {
      toast.error("Erreur lors de la création du live");
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copié`);
    } catch {
      toast.error("Copie impossible");
    }
  }

  if (!user) return <p className="p-8">Veuillez vous connecter.</p>;
  if (!artistProfile) return <p className="p-8">Profil artiste requis.</p>;

  const upcoming = streams.filter((s) => s.status === "scheduled" || s.status === "live");
  const past = streams.filter((s) => s.status === "ended" || s.status === "canceled");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Lives</h1>
      <p className="mt-1 text-sm text-gray-600">Programmez et gérez vos sessions live atelier.</p>

      {/* Formulaire */}
      <section className="mt-8 rounded-lg border bg-white p-6">
        <h2 className="font-semibold">Programmer un live</h2>
        <form onSubmit={onCreate} className="mt-4 space-y-4">
          <input
            required
            placeholder="Titre du live"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating ? "Création…" : "Créer le live"}
          </button>
        </form>

        {lastCreated && (
          <div className="mt-6 rounded border bg-gray-50 p-4 text-sm">
            <p className="font-medium">Informations de diffusion</p>
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-gray-500">RTMP ingest : </span>
                <code className="break-all">{lastCreated.rtmp_ingest_url}</code>{" "}
                <button
                  onClick={() => copy(lastCreated.rtmp_ingest_url ?? "", "Ingest URL")}
                  className="ml-2 text-xs underline"
                >
                  Copier
                </button>
              </div>
              <div>
                <span className="text-gray-500">Stream key : </span>
                <code className="break-all">{lastCreated.stream_key}</code>{" "}
                <button
                  onClick={() => copy(lastCreated.stream_key ?? "", "Stream key")}
                  className="ml-2 text-xs underline"
                >
                  Copier
                </button>
              </div>
              {lastCreated.provider_playback_id && (
                <div>
                  <span className="text-gray-500">Playback URL : </span>
                  <code className="break-all">
                    https://stream.mux.com/{lastCreated.provider_playback_id}.m3u8
                  </code>
                </div>
              )}
              <a
                href={`/live/${lastCreated.id}`}
                className="inline-block text-xs underline"
              >
                Aperçu du lecteur →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Listes */}
      <section className="mt-10">
        <h2 className="font-semibold">À venir / En direct</h2>
        {loading ? (
          <p className="mt-2 text-sm text-gray-500">Chargement…</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Aucun live programmé.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((s) => (
              <li key={s.id} className="rounded border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <a href={`/live/${s.id}`} className="font-medium hover:underline">
                      {s.title}
                    </a>
                    <p className="text-xs text-gray-500">
                      {s.status === "live" ? "EN DIRECT" : s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("fr-FR") : "Non planifié"}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs ${s.status === "live" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {s.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Historique</h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Aucun live passé.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {past.map((s) => (
              <li key={s.id} className="rounded border bg-white p-4">
                <a href={`/live/${s.id}`} className="font-medium hover:underline">
                  {s.title}
                </a>
                <p className="text-xs text-gray-500">
                  {s.ended_at ? new Date(s.ended_at).toLocaleString("fr-FR") : s.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
