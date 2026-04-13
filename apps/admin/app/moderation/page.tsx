"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface CommentRow {
  id: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
  user: { display_name: string };
  post: { caption: string | null };
}

export default function ModerationPage() {
  const [comments, setComments] = useState<CommentRow[]>([]);

  useEffect(() => {
    supabase
      .from("comments")
      .select("id, body, is_hidden, created_at, user:profiles(display_name), post:carnet_posts(caption)")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setComments((data as unknown as CommentRow[]) || []));
  }, []);

  async function toggleHidden(id: string, current: boolean) {
    await supabase.from("comments").update({ is_hidden: !current }).eq("id", id);
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, is_hidden: !current } : c)));
  }

  async function deleteComment(id: string) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Moderation</h1>
      <p className="mt-1 text-gray-600">Derniers commentaires</p>

      <div className="mt-8 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className={`rounded-lg border p-4 ${comment.is_hidden ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{comment.user.display_name}</p>
                <p className="mt-1">{comment.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                  {comment.post.caption && ` — sur "${comment.post.caption.slice(0, 40)}..."`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleHidden(comment.id, comment.is_hidden)}
                  className="rounded px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200"
                >
                  {comment.is_hidden ? "Afficher" : "Masquer"}
                </button>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="rounded px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
