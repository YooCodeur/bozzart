"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface PostRow {
  id: string;
  type: string;
  caption: string | null;
  media_urls: string[];
  reaction_counts: Record<string, number>;
  comment_count: number;
  created_at: string;
}

export default function CarnetListPage() {
  const { artistProfile } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchPosts() {
    if (!artistProfile) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("carnet_posts")
      .select("*")
      .eq("artist_id", artistProfile.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          const msg = "Erreur lors du chargement des posts.";
          setError(msg);
          toast.error(msg);
        } else {
          setPosts((data as PostRow[]) || []);
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchPosts();
  }, [artistProfile]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon carnet</h1>
        <Link href="/dashboard/carnet/new" className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Nouveau post
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Reessayer
          </button>
        </div>
      ) : loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucun post. Partagez votre processus creatif !</p>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">{post.type}</span>
                  <time className="ml-2 text-sm text-gray-400">{new Date(post.created_at).toLocaleDateString("fr-FR")}</time>
                </div>
              </div>
              {post.caption && <p className="mt-3 text-gray-800">{post.caption}</p>}
              {post.media_urls.length > 0 && (
                <img src={post.media_urls[0]} alt="" className="mt-3 max-h-48 rounded-lg object-cover" />
              )}
              <div className="mt-3 flex gap-4 text-sm text-gray-500">
                <span>{post.reaction_counts?.touched || 0} touches</span>
                <span>{post.comment_count} commentaires</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
