"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { FeedPostCard, type FeedPost, type FeedSource } from "./FeedPostCard";

const PAGE_SIZE = 10;

type PostWithSource = FeedPost & { source?: FeedSource };

export function FeedList() {
  const [posts, setPosts] = useState<PostWithSource[]>([]);
  const [offset, setOffset] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const POST_SELECT =
    "id, type, caption, media_urls, reaction_counts, comment_count, created_at, linked_artwork_id, artist:artist_profiles!inner(id, slug, full_name, profiles!inner(display_name, avatar_url)), artwork:artworks(id, slug, title, primary_image_url)";

  // Legacy chronological fetch (fallback on RPC error or no auth).
  const fetchLegacy = useCallback(
    async (currentCursor: string | null): Promise<PostWithSource[]> => {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("carnet_posts")
        .select(POST_SELECT)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (currentCursor) query = query.lt("created_at", currentCursor);
      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      return ((data as unknown as FeedPost[]) || []).map((p) => ({ ...p, source: undefined }));
    },
    [],
  );

  // Personalised RPC fetch (phase 14.3).
  const fetchPersonalized = useCallback(
    async (currentOffset: number): Promise<PostWithSource[]> => {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        // Not authenticated → fallback path.
        throw new Error("no-auth");
      }

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_personalized_carnet_feed",
        { p_user_id: userId, p_limit: PAGE_SIZE, p_offset: currentOffset },
      );
      if (rpcError) throw rpcError;

      const rows = (rpcData as Array<{ post_id: string; source: FeedSource }> | null) || [];
      if (rows.length === 0) return [];

      const ids = rows.map((r) => r.post_id);
      const { data: posts, error: postsErr } = await supabase
        .from("carnet_posts")
        .select(POST_SELECT)
        .in("id", ids);
      if (postsErr) throw postsErr;

      const sourceById = new Map(rows.map((r) => [r.post_id, r.source]));
      // Preserve RPC ordering.
      const byId = new Map(((posts as unknown as FeedPost[]) || []).map((p) => [p.id, p]));
      const ordered: PostWithSource[] = [];
      for (const r of rows) {
        const p = byId.get(r.post_id);
        if (p) ordered.push({ ...p, source: sourceById.get(r.post_id) });
      }
      return ordered;
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (loading && posts.length > 0) return;
    if (!hasMore) return;
    setLoading(true);
    setError(null);
    try {
      let batch: PostWithSource[] = [];
      if (!usingFallback) {
        try {
          batch = await fetchPersonalized(offset);
        } catch {
          // First failure: switch to fallback permanently for this session.
          setUsingFallback(true);
          batch = await fetchLegacy(cursor);
        }
      } else {
        batch = await fetchLegacy(cursor);
      }

      if (batch.length < PAGE_SIZE) setHasMore(false);
      if (batch.length > 0) {
        setPosts((prev) => [...prev, ...batch]);
        setCursor(batch[batch.length - 1].created_at);
        setOffset((prev) => prev + batch.length);
      }
    } catch {
      const msg = "Impossible de charger le feed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [cursor, offset, fetchLegacy, fetchPersonalized, hasMore, loading, posts.length, usingFallback]);

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
        <FeedPostCard key={post.id} post={post} source={post.source} />
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
