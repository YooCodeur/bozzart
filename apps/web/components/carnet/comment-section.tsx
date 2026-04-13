"use client";

import { useEffect, useState } from "react";
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

interface CommentSectionProps {
  postId: string;
  commentsEnabled: boolean;
  initialCount?: number;
}

export function CommentSection({ postId, commentsEnabled, initialCount = 0 }: CommentSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("comments")
      .select("id, body, parent_id, created_at, user:profiles(id, display_name, avatar_url)")
      .eq("post_id", postId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger les commentaires.");
          return;
        }
        setComments((data as unknown as CommentRow[]) || []);
      });
  }, [postId, expanded]);

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

      if (data) {
        setComments((prev) => [...prev, data as unknown as CommentRow]);
      }
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
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-gray-500 hover:text-gray-700"
        aria-label={expanded ? "Masquer les commentaires" : "Afficher les commentaires"}
      >
        {expanded ? "Masquer les commentaires" : `${initialCount} commentaire${initialCount !== 1 ? "s" : ""}`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs">
                  {comment.user.display_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{comment.user.display_name}</span>{" "}
                    {comment.body}
                  </p>
                  <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                    <time>{new Date(comment.created_at).toLocaleDateString("fr-FR")}</time>
                    {user && (
                      <button onClick={() => setReplyTo(comment.id)} className="hover:text-gray-600">
                        Repondre
                      </button>
                    )}
                  </div>

                  {/* Reponses */}
                  {replies(comment.id).map((reply) => (
                    <div key={reply.id} className="mt-2 ml-4 flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs">
                        {reply.user.display_name.charAt(0)}
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{reply.user.display_name}</span>{" "}
                        {reply.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Formulaire */}
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Repondre..." : "Ajouter un commentaire..."}
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
    </div>
  );
}
