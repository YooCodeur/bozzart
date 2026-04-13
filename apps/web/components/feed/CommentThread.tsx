"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface CommentRow {
  id: string;
  body: string;
  parent_id: string | null;
  created_at: string;
  user: { id: string; display_name: string; avatar_url: string | null };
}

interface CommentThreadProps {
  postId: string;
  commentsEnabled: boolean;
  initialCount?: number;
}

const MENTION_RE = /@([a-zA-Z0-9_-]+)/g;

/**
 * Render a comment body with @slug mentions linked to profile pages.
 */
function renderBody(body: string) {
  const parts: Array<string | { slug: string }> = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = MENTION_RE.exec(body)) !== null) {
    if (m.index > lastIdx) parts.push(body.slice(lastIdx, m.index));
    parts.push({ slug: m[1]! });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < body.length) parts.push(body.slice(lastIdx));

  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <Link key={i} href={`/${p.slug}`} className="text-brand-600 hover:underline">
        @{p.slug}
      </Link>
    ),
  );
}

/**
 * Inline, expandable comment thread used in feed cards.
 * - Displays flat list + 1-level replies
 * - Realtime subscribes to `comments` INSERT/DELETE for this post
 * - Also subscribes to `reactions` INSERT/DELETE so parent can react to counts
 *   (exposed via window event `bozzart:reactions-change` — TODO: prop callback)
 * - Detects @slug mentions and links them.
 */
export function CommentThread({ postId, commentsEnabled, initialCount = 0 }: CommentThreadProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(initialCount);

  const fetchComments = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, body, parent_id, created_at, user:profiles(id, display_name, avatar_url)")
      .eq("post_id", postId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Impossible de charger les commentaires.");
      return;
    }
    setComments((data as unknown as CommentRow[]) || []);
    setCount((data?.length as number) || 0);
  }, [postId]);

  useEffect(() => {
    if (!expanded) return;
    fetchComments();
  }, [expanded, fetchComments]);

  // Realtime: comments + reactions INSERT/DELETE for this post
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`post-${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        () => {
          setCount((c) => c + 1);
          if (expanded) fetchComments();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        () => {
          setCount((c) => Math.max(0, c - 1));
          if (expanded) fetchComments();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reactions", filter: `post_id=eq.${postId}` },
        (payload) => {
          window.dispatchEvent(
            new CustomEvent("bozzart:reactions-change", { detail: { postId, type: "INSERT", payload: payload.new } }),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reactions", filter: `post_id=eq.${postId}` },
        (payload) => {
          window.dispatchEvent(
            new CustomEvent("bozzart:reactions-change", { detail: { postId, type: "DELETE", payload: payload.old } }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, expanded, fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!newComment.trim() || sending) return;
    setSending(true);

    const supabase = createSupabaseBrowserClient();
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          body: newComment.trim(),
          parent_id: replyTo,
        })
        .select("id, body, parent_id, created_at, user:profiles(id, display_name, avatar_url)")
        .single();
      if (error) throw error;
      if (data) setComments((prev) => [...prev, data as unknown as CommentRow]);
      setNewComment("");
      setReplyTo(null);
    } catch {
      toast.error("Impossible d'envoyer le commentaire. Veuillez reessayer.");
    } finally {
      setSending(false);
    }
  }

  if (!commentsEnabled) return null;

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="px-4 pb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-gray-500 hover:text-gray-700"
        aria-expanded={expanded}
      >
        {expanded
          ? "Masquer les commentaires"
          : `${count} commentaire${count !== 1 ? "s" : ""}`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <div className="flex gap-2">
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {comment.user.display_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{comment.user.display_name}</span>{" "}
                    {renderBody(comment.body)}
                  </p>
                  <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                    <time>{new Date(comment.created_at).toLocaleDateString("fr-FR")}</time>
                    {user && (
                      <button onClick={() => setReplyTo(comment.id)} className="hover:text-gray-600">
                        Repondre
                      </button>
                    )}
                  </div>

                  {replies(comment.id).map((reply) => (
                    <div key={reply.id} className="mt-2 ml-4 flex gap-2">
                      <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                        {reply.user.display_name.charAt(0)}
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{reply.user.display_name}</span>{" "}
                        {renderBody(reply.body)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Repondre... (@slug pour mentionner)" : "Ajouter un commentaire... (@slug pour mentionner)"}
                className="flex-1 rounded-full border border-gray-300 px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              {replyTo && (
                <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-gray-400">
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={sending || !newComment.trim()}
                className="rounded-full bg-black px-4 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {sending ? "..." : "Envoyer"}
              </button>
            </form>
          ) : (
            <button
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
              className="text-sm text-brand-600 hover:underline"
            >
              Connectez-vous pour commenter
            </button>
          )}
        </div>
      )}

      {/* Reaction animation styles (scale + color) — consumed by button[data-reaction-btn] */}
      <style jsx global>{`
        [data-reaction-btn] {
          transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
        }
        [data-reaction-btn]:active {
          transform: scale(1.25);
        }
        [data-reaction-btn][data-active="true"] {
          background-color: rgb(254 226 226);
          color: rgb(220 38 38);
        }
      `}</style>
    </div>
  );
}
