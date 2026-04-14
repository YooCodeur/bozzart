// Reengagement cron: called daily (pg_cron or external scheduler).
// Identifies users inactive for 7+ days, picks a notable activity from their
// followed artists, creates an in-app notification + push, and records a job.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getServiceClient, notify } from "../_shared/notify.ts";

serve(async (_req) => {
  const supabase = getServiceClient();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch users whose last_sign_in_at is older than 7 days (or null).
  const { data: users, error } = await supabase
    .schema("auth")
    .from("users")
    .select("id,last_sign_in_at")
    .or(`last_sign_in_at.lt.${cutoff},last_sign_in_at.is.null`)
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;

  for (const u of users ?? []) {
    // Skip if we already sent a reengagement within the last 7 days.
    const { data: recent } = await supabase
      .from("reengagement_jobs")
      .select("id")
      .eq("user_id", u.id)
      .gte("scheduled_at", cutoff)
      .limit(1);
    if (recent && recent.length > 0) continue;

    // Pick a notable activity: latest carnet post from a followed artist.
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", u.id)
      .limit(50);
    const followedIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);

    let title = "On vous attend sur Bozzart";
    let body = "Decouvrez les dernieres nouveautes de vos artistes.";
    let url: string | undefined = "/feed";

    if (followedIds.length > 0) {
      const { data: posts } = await supabase
        .from("carnet_posts")
        .select("id,content,author_id,created_at")
        .in("author_id", followedIds)
        .order("created_at", { ascending: false })
        .limit(1);
      const post = posts?.[0];
      if (post) {
        const { data: author } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", post.author_id)
          .maybeSingle();
        title = `${author?.display_name ?? "Un artiste suivi"} a publie`;
        body = (post.content ?? "").slice(0, 140) || "Nouveau post a decouvrir";
        url = `/carnet/${post.id}`;
      }
    }

    // Record job (pre-insert so a failure still leaves a trail).
    const { data: job } = await supabase
      .from("reengagement_jobs")
      .insert({ user_id: u.id, reason: "inactive_7d" })
      .select("id")
      .single();

    await notify({
      userId: u.id,
      category: "reengagement",
      title,
      body,
      url,
    });

    if (job) {
      await supabase
        .from("reengagement_jobs")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", job.id);
    }

    processed += 1;
  }

  return new Response(JSON.stringify({ processed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
