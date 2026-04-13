import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { getDefaultProvider } from "../_shared/live/provider.ts";

interface CreateLiveStreamRequest {
  title: string;
  description?: string;
  scheduled_at?: string | null;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Identify caller
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: artist } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", userRes.user.id)
    .single();

  if (!artist) {
    return new Response(JSON.stringify({ error: "Artist profile required" }), { status: 403 });
  }

  let body: CreateLiveStreamRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  if (!body.title || body.title.trim().length === 0) {
    return new Response(JSON.stringify({ error: "title is required" }), { status: 400 });
  }

  const provider = getDefaultProvider();
  const created = await provider.createStream({
    title: body.title,
    description: body.description,
    scheduledAt: body.scheduled_at ?? null,
  });

  const { data: inserted, error: insertErr } = await admin
    .from("live_streams")
    .insert({
      artist_id: artist.id,
      title: body.title,
      description: body.description ?? null,
      scheduled_at: body.scheduled_at ?? null,
      status: "scheduled",
      provider: "mux",
      provider_stream_id: created.providerStreamId,
      provider_playback_id: created.providerPlaybackId,
      stream_key: created.streamKey,
      rtmp_ingest_url: created.rtmpIngestUrl,
    })
    .select()
    .single();

  if (insertErr || !inserted) {
    return new Response(JSON.stringify({ error: insertErr?.message ?? "insert failed" }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({
      stream: inserted,
      playback_url: provider.getPlaybackUrl(created.providerPlaybackId),
    }),
    { headers: { "Content-Type": "application/json" }, status: 201 },
  );
});
