"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export interface FeedPost {
  id: string;
  type: string;
  caption: string | null;
  media_urls: string[];
  reaction_counts: Record<string, number> | null;
  comment_count: number;
  created_at: string;
  linked_artwork_id: string | null;
  artist: {
    id: string;
    slug: string;
    full_name: string;
    profiles: {
      display_name: string;
      avatar_url: string | null;
    } | null;
  };
  artwork: {
    id: string;
    slug: string;
    title: string;
    primary_image_url: string | null;
  } | null;
}

export type FeedSource = "follow" | "discovery";

const CAPTION_MAX = 180;

const reactionLabels: Array<{ key: string; emoji: string; label: string }> = [
  { key: "touched", emoji: "💫", label: "Touche" },
  { key: "want", emoji: "🔥", label: "J'en veux" },
  { key: "how", emoji: "🤔", label: "Comment c'est fait" },
  { key: "share", emoji: "📤", label: "Partager" },
];

function formatRelativeFr(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "a l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  const w = Math.floor(d / 7);
  if (w < 5) return `il y a ${w} sem`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `il y a ${mo} mois`;
  const y = Math.floor(d / 365);
  return `il y a ${y} an${y > 1 ? "s" : ""}`;
}

export function FeedPostCard({ post, source }: { post: FeedPost; source?: FeedSource }) {
  const [expanded, setExpanded] = useState(false);

  const displayName = post.artist.profiles?.display_name || post.artist.full_name;
  const sourceLabel =
    source === "follow"
      ? `Parce que vous suivez ${displayName}`
      : source === "discovery"
        ? "Populaire en ce moment"
        : null;
  const avatarUrl = post.artist.profiles?.avatar_url;
  const caption = post.caption || "";
  const isLong = caption.length > CAPTION_MAX;
  const shownCaption = expanded || !isLong ? caption : caption.slice(0, CAPTION_MAX).trimEnd() + "...";
  const firstImage = post.media_urls?.[0];

  function handleReactionStub(label: string) {
    // TODO: wire up reactions to Supabase (see ReactionBar) once feed reactions are scoped.
    toast.message(`${label} - bientot disponible`);
  }

  return (
    <article className="rounded-lg border bg-white">
      {sourceLabel && (
        <p
          className={`px-4 pt-3 text-xs ${source === "follow" ? "text-blue-600" : "text-amber-600"}`}
          aria-label={sourceLabel}
        >
          {sourceLabel}
        </p>
      )}
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Link
          href={`/${post.artist.slug}`}
          className="flex items-center gap-3"
          aria-label={`Voir le profil de ${displayName}`}
        >
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <time className="text-xs text-gray-400" dateTime={post.created_at}>
              {formatRelativeFr(post.created_at)}
            </time>
          </div>
        </Link>
      </header>

      {/* Media */}
      {post.type === "image" && firstImage ? (
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={firstImage}
            alt={caption ? caption.slice(0, 80) : `Publication de ${displayName}`}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        </div>
      ) : post.type === "video" ? (
        <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
          {/* TODO: video playback (HLS or mp4) */}
          Video bientot disponible
        </div>
      ) : post.type === "audio" ? (
        <div className="flex w-full items-center justify-center bg-gray-50 p-6 text-sm text-gray-500">
          {/* TODO: audio player */}
          Audio bientot disponible
        </div>
      ) : null}

      {/* Reactions */}
      <div className="flex items-center gap-2 px-4 pt-3">
        {reactionLabels.map((r) => (
          <button
            key={r.key}
            onClick={() => handleReactionStub(r.label)}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-200"
            aria-label={r.label}
            title={r.label}
          >
            <span>{r.emoji}</span>
            {(post.reaction_counts?.[r.key] || 0) > 0 && (
              <span className="text-xs">{post.reaction_counts?.[r.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-4 pt-3 text-sm">
          <span className="font-medium">{displayName}</span>{" "}
          <span className="whitespace-pre-wrap">{shownCaption}</span>
          {isLong && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              Lire la suite
            </button>
          )}
        </div>
      )}

      {/* Linked artwork (no price) */}
      {post.artwork && (
        <Link
          href={`/${post.artist.slug}/${post.artwork.slug}`}
          className="mx-4 mt-3 flex items-center gap-3 rounded-md border p-2 transition hover:bg-gray-50"
        >
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
            {post.artwork.primary_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.artwork.primary_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-400">Oeuvre liee</p>
            <p className="truncate text-sm font-medium">{post.artwork.title}</p>
          </div>
        </Link>
      )}

      {/* Comments count */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500">
          {post.comment_count} commentaire{post.comment_count !== 1 ? "s" : ""}
        </p>
      </div>
    </article>
  );
}
