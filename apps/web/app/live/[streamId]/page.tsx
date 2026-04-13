import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { LiveViewer } from "@/components/live/live-viewer";

interface Props {
  params: { streamId: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("live_streams")
    .select("title, description")
    .eq("id", params.streamId)
    .single();
  if (!data) return {};
  return {
    title: `${data.title} — Live Bozzart`,
    description: data.description ?? "Session live atelier sur Bozzart",
  };
}

export default async function LiveStreamPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: stream } = await supabase
    .from("live_streams")
    .select("*, artist_profiles!inner(id, full_name, slug, user_id)")
    .eq("id", params.streamId)
    .single();

  if (!stream) notFound();

  const playbackUrl = stream.provider_playback_id
    ? `https://stream.mux.com/${stream.provider_playback_id}.m3u8`
    : null;

  return (
    <LiveViewer
      streamId={stream.id}
      title={stream.title}
      description={stream.description}
      status={stream.status}
      scheduledAt={stream.scheduled_at}
      playbackUrl={playbackUrl}
      recordingUrl={stream.recording_url}
      artist={{
        id: stream.artist_profiles.id,
        fullName: stream.artist_profiles.full_name,
        slug: stream.artist_profiles.slug,
      }}
    />
  );
}
