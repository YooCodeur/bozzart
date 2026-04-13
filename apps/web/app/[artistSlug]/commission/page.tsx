"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  params: { artistSlug: string };
}

interface ArtistForCommission {
  id: string; // artist profile user id (= profiles.id)
  full_name: string;
  slug: string;
}

const MAX_REFERENCES = 5;

export default function CommissionRequestPage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createSupabaseBrowserClient();

  const [artist, setArtist] = useState<ArtistForCommission | null>(null);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [medium, setMedium] = useState("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("artist_profiles")
      .select("user_id, full_name, slug")
      .eq("slug", params.artistSlug)
      .single()
      .then(({ data }) => {
        if (data) {
          setArtist({ id: data.user_id, full_name: data.full_name, slug: data.slug });
        }
        setLoading(false);
      });
  }, [params.artistSlug, supabase]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected].slice(0, MAX_REFERENCES);
    setFiles(combined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/${params.artistSlug}/commission`);
      return;
    }
    if (!artist) return;
    if (!title.trim() || !brief.trim()) {
      setError("Titre et description requis");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Upload references
      const uploadedPaths: string[] = [];
      for (const file of files.slice(0, MAX_REFERENCES)) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("commissions")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        uploadedPaths.push(path);
      }

      // 2. Budget midpoint (cents) for budget_cents
      const minCents = budgetMin ? Math.round(parseFloat(budgetMin) * 100) : null;
      const maxCents = budgetMax ? Math.round(parseFloat(budgetMax) * 100) : null;
      const budgetCents =
        minCents && maxCents ? Math.round((minCents + maxCents) / 2) : maxCents ?? minCents;

      // 3. Insert commission
      const { error: insErr } = await supabase.from("commissions").insert({
        buyer_id: user.id,
        artist_id: artist.id,
        title,
        brief,
        description: brief,
        medium: medium || null,
        dimensions_width: width ? parseInt(width, 10) : null,
        dimensions_height: height ? parseInt(height, 10) : null,
        reference_images: uploadedPaths,
        budget_cents: budgetCents,
        deadline: deadline || null,
        status: "pending",
      });
      if (insErr) throw insErr;

      router.push("/dashboard/commissions");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      setError(msg);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Chargement…</div>;
  }

  if (!artist) {
    return <div className="p-8 text-gray-500">Artiste introuvable.</div>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Commander une œuvre sur mesure</h1>
      <p className="mt-1 text-sm text-gray-500">
        Envoyez un brief à {artist.full_name}. L&apos;artiste vous proposera un devis.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">Titre de la commande</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Portrait de famille à l'aquarelle"
          />
        </div>

        <div>
          <label htmlFor="brief" className="block text-sm font-medium">Brief détaillé</label>
          <textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            required
            rows={6}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Décrivez votre projet, ambiance, style recherché…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="medium" className="block text-sm font-medium">Medium souhaité</label>
            <input
              id="medium"
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Huile, aquarelle…"
            />
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium">Deadline souhaitée</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="width" className="block text-sm font-medium">Largeur (cm)</label>
            <input
              id="width"
              type="number"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium">Hauteur (cm)</label>
            <input
              id="height"
              type="number"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="budgetMin" className="block text-sm font-medium">Budget min (€)</label>
            <input
              id="budgetMin"
              type="number"
              min="0"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="budgetMax" className="block text-sm font-medium">Budget max (€)</label>
            <input
              id="budgetMax"
              type="number"
              min="0"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="refs" className="block text-sm font-medium">
            Images de référence ({files.length}/{MAX_REFERENCES})
          </label>
          <input
            id="refs"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={files.length >= MAX_REFERENCES}
            className="mt-1 block w-full text-sm"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Envoi…" : "Demander un devis"}
        </button>
      </form>
    </main>
  );
}
