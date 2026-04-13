"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { PostCarousel } from "@/components/carnet/PostCarousel";
import { FeedPostCard, type FeedPost } from "@/components/feed/FeedPostCard";
import type { PostType } from "@bozzart/api";

// UI-level post kind. Maps to backend PostType enum below.
type PostKind = "process" | "video" | "audio" | "text" | "linked-artwork";

const KINDS: Array<{ key: PostKind; label: string; hint: string }> = [
  { key: "process", label: "Process", hint: "Photos avant/pendant/apres (jusqu'a 10)" },
  { key: "video", label: "Video", hint: "Clip court, autoplay muted" },
  { key: "audio", label: "Audio", hint: "Waveform audio" },
  { key: "text", label: "Texte", hint: "Reflexion longue" },
  { key: "linked-artwork", label: "Oeuvre", hint: "Lier a une oeuvre publiee" },
];

function kindToPostType(kind: PostKind): PostType {
  switch (kind) {
    case "process":
      return "mixed";
    case "video":
      return "video";
    case "audio":
      return "audio";
    case "text":
      return "text";
    case "linked-artwork":
      return "photo";
  }
}

const DRAFT_KEY = "bozzart:carnet-draft:v1";

interface Draft {
  kind: PostKind;
  caption: string;
  bodyHtml: string;
  mediaUrls: string[];
  linkedArtworkId: string;
  commentsEnabled: boolean;
}

export default function NewPostPage() {
  const router = useRouter();
  const { artistProfile } = useAuth();
  const [kind, setKind] = useState<PostKind>("process");
  const [caption, setCaption] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState("");
  const [linkedArtworkId, setLinkedArtworkId] = useState("");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<{ id: string; title: string; primary_image_url: string | null; slug: string }[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Restore draft (localStorage — TODO: persist to backend drafts table)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        setKind(d.kind);
        setCaption(d.caption || "");
        setBodyHtml(d.bodyHtml || "");
        setMediaUrls(d.mediaUrls || []);
        setLinkedArtworkId(d.linkedArtworkId || "");
        setCommentsEnabled(d.commentsEnabled ?? true);
      }
    } catch {
      // ignore
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!artistProfile) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("artworks")
      .select("id, title, primary_image_url, slug")
      .eq("artist_id", artistProfile.id)
      .eq("status", "published")
      .order("title")
      .then(({ data, error }) => {
        if (error) {
          const msg = "Erreur lors du chargement des oeuvres.";
          setError(msg);
          toast.error(msg);
        } else {
          setArtworks((data as typeof artworks) || []);
        }
      });
  }, [artistProfile]);

  const saveDraft = useCallback(() => {
    const draft: Draft = { kind, caption, bodyHtml, mediaUrls, linkedArtworkId, commentsEnabled };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      toast.success("Brouillon enregistre");
    } catch {
      toast.error("Impossible d'enregistrer le brouillon.");
    }
  }, [kind, caption, bodyHtml, mediaUrls, linkedArtworkId, commentsEnabled]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  function addMediaUrl() {
    if (!mediaInput.trim()) return;
    if (mediaUrls.length >= 10) {
      toast.error("10 medias maximum.");
      return;
    }
    setMediaUrls((prev) => [...prev, mediaInput.trim()]);
    setMediaInput("");
  }

  function removeMedia(i: number) {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handlePublish() {
    if (!artistProfile) return;
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.from("carnet_posts").insert({
      artist_id: artistProfile.id,
      type: kindToPostType(kind),
      caption: caption || null,
      body_html: bodyHtml || null,
      media_urls: mediaUrls,
      linked_artwork_id: kind === "linked-artwork" ? linkedArtworkId || null : linkedArtworkId || null,
      comments_enabled: commentsEnabled,
    });

    if (error) {
      const msg = "Erreur lors de la publication du post.";
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }

    clearDraft();
    router.push("/dashboard/carnet");
  }

  // Build a fake FeedPost for preview rendering
  const linkedArt = artworks.find((a) => a.id === linkedArtworkId) || null;
  const previewPost: FeedPost = {
    id: "preview",
    type: kind === "process" ? "image" : kindToPostType(kind),
    caption: caption || null,
    media_urls: mediaUrls,
    reaction_counts: null,
    comment_count: 0,
    created_at: new Date().toISOString(),
    linked_artwork_id: linkedArtworkId || null,
    artist: {
      id: (artistProfile?.id as string) || "preview",
      slug: (artistProfile?.slug as string) || "preview",
      full_name: ((artistProfile as unknown as { fullName?: string })?.fullName as string) || "Vous",
      profiles: null,
    },
    artwork: linkedArt
      ? {
          id: linkedArt.id,
          slug: linkedArt.slug,
          title: linkedArt.title,
          primary_image_url: linkedArt.primary_image_url,
        }
      : null,
  };

  if (!draftLoaded) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nouveau post</h1>
        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50"
          >
            Enregistrer brouillon
          </button>
          <button
            onClick={() => setPreviewing((p) => !p)}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50"
          >
            {previewing ? "Continuer l'edition" : "Previsualiser"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {previewing ? (
        <div className="mt-8 max-w-xl">
          <p className="mb-3 text-sm text-gray-500">Voici ce que vos followers verront :</p>
          {/* For carousel preview we wrap FeedPostCard with a carousel override when >1 image */}
          {mediaUrls.length > 1 ? (
            <article className="overflow-hidden rounded-lg border bg-white">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-gray-200" />
                <div className="text-sm font-medium">{previewPost.artist.full_name}</div>
              </div>
              <PostCarousel images={mediaUrls} alt={caption} />
              {caption && <p className="px-4 py-3 text-sm">{caption}</p>}
            </article>
          ) : (
            <FeedPostCard post={previewPost} />
          )}
        </div>
      ) : (
        <div className="mt-8 max-w-lg space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de post</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  title={k.hint}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    kind === k.key ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{KINDS.find((k) => k.key === kind)?.hint}</p>
          </div>

          {(kind === "process" || kind === "video" || kind === "audio") && (
            <div>
              <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700">
                {kind === "process" ? "Images (ordre = carousel)" : "URL du media"}
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mediaUrl"
                  type="url"
                  value={mediaInput}
                  onChange={(e) => setMediaInput(e.target.value)}
                  placeholder={
                    kind === "process"
                      ? "URL d'une image, puis cliquer Ajouter"
                      : kind === "video"
                        ? "URL de la video"
                        : "URL de l'audio"
                  }
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (kind === "process") addMediaUrl();
                    else setMediaUrls(mediaInput.trim() ? [mediaInput.trim()] : []);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {kind === "process" ? "Ajouter" : "Definir"}
                </button>
              </div>
              {/* TODO: remplacer par upload Supabase Storage */}
              {mediaUrls.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {mediaUrls.map((u, i) => (
                    <li key={`${u}-${i}`} className="flex items-center justify-between rounded border bg-gray-50 px-2 py-1 text-xs">
                      <span className="truncate">{u}</span>
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {kind === "linked-artwork" && artworks.length > 0 && (
            <div>
              <label htmlFor="linkedArtworkId" className="block text-sm font-medium text-gray-700">
                Oeuvre liee
              </label>
              <select
                id="linkedArtworkId"
                value={linkedArtworkId}
                onChange={(e) => setLinkedArtworkId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Choisir une oeuvre</option>
                {artworks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Qu'est-ce que vous partagez aujourd'hui ?"
            />
          </div>

          {kind === "text" && (
            <div>
              <label htmlFor="bodyHtml" className="block text-sm font-medium text-gray-700">
                Texte long
              </label>
              {/* TODO: remplacer par editeur TipTap */}
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
            <input
              type="checkbox"
              checked={commentsEnabled}
              onChange={(e) => setCommentsEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Activer les commentaires</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handlePublish}
              disabled={saving}
              className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Publication..." : "Publier"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
