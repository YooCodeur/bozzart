"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { PostType } from "@bozzart/api";

export default function NewPostPage() {
  const router = useRouter();
  const { artistProfile } = useAuth();
  const [type, setType] = useState<PostType>("photo");
  const [caption, setCaption] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [linkedArtworkId, setLinkedArtworkId] = useState("");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!artistProfile) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("artworks")
      .select("id, title")
      .eq("artist_id", artistProfile.id)
      .eq("status", "published")
      .order("title")
      .then(({ data, error }) => {
        if (error) {
          const msg = "Erreur lors du chargement des oeuvres.";
          setError(msg);
          toast.error(msg);
        } else {
          setArtworks((data as { id: string; title: string }[]) || []);
        }
      });
  }, [artistProfile]);

  async function handlePublish() {
    if (!artistProfile) return;
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.from("carnet_posts").insert({
      artist_id: artistProfile.id,
      type,
      caption: caption || null,
      body_html: bodyHtml || null,
      media_urls: mediaUrl ? [mediaUrl] : [],
      linked_artwork_id: linkedArtworkId || null,
      comments_enabled: commentsEnabled,
    });

    if (error) {
      const msg = "Erreur lors de la publication du post.";
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }

    router.push("/dashboard/carnet");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Nouveau post</h1>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <div className="mt-2 flex gap-2">
            {(["photo", "video", "audio", "text", "mixed"] as PostType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                  type === t ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {type !== "text" && (
          <div>
            <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700">URL du media</label>
            <input
              id="mediaUrl"
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de l'image/video/audio"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        )}

        {/* Lien vers une oeuvre */}
        {artworks.length > 0 && (
          <div>
            <label htmlFor="linkedArtworkId" className="block text-sm font-medium text-gray-700">Lier a une oeuvre</label>
            <select
              id="linkedArtworkId"
              value={linkedArtworkId}
              onChange={(e) => setLinkedArtworkId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Aucune oeuvre</option>
              {artworks.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700">Caption</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Qu'est-ce que vous partagez aujourd'hui ?"
          />
        </div>

        {type === "text" && (
          <div>
            <label htmlFor="bodyHtml" className="block text-sm font-medium text-gray-700">Texte long</label>
            <textarea
              id="bodyHtml"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={commentsEnabled} onChange={(e) => setCommentsEnabled(e.target.checked)} className="rounded" />
          <span className="text-sm">Activer les commentaires</span>
        </label>

        <button onClick={handlePublish} disabled={saving} className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Publication..." : "Publier"}
        </button>
      </div>
    </div>
  );
}
