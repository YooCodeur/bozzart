"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { FeedPostCard, type FeedPost } from "./FeedPostCard";

const PAGE_SIZE = 10;

export function FeedList() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchBatch = useCallback(
    async (currentCursor: string | null) => {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("carnet_posts")
        .select(
          // TODO: switch to algorithmic/follow-based feed once follows table is live.
          "id, type, caption, media_urls, reaction_counts, comment_count, created_at, linked_artwork_id, artist:artist_profiles!inner(id, slug, full_name, profiles!inner(display_name, avatar_url)), artwork:artworks(id, slug, title, primary_image_url)",
        )
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (currentCursor) {
        query = query.lt("created_at", currentCursor);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      return (data as unknown as FeedPost[]) || [];
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (loading && posts.length > 0) return;
    if (!hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const batch = await fetchBatch(cursor);
      if (batch.length < PAGE_SIZE) setHasMore(false);
      if (batch.length > 0) {
        setPosts((prev) => [...prev, ...batch]);
        setCursor(batch[batch.length - 1].created_at);
      }
    } catch {
      const msg = "Impossible de charger le feed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [cursor, fetchBatch, hasMore, loading, posts.length]);

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  if (error && posts.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={() => loadMore()}
          className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Reessayer
        </button>
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <p className="text-gray-600">Suivez des artistes pour remplir votre feed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}

      {loading && (
        <p className="py-6 text-center text-sm text-gray-500" role="status" aria-live="polite">
          Chargement...
        </p>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-6 text-center text-sm text-gray-400">Vous etes a jour</p>
      )}

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
    </div>
  );
}
