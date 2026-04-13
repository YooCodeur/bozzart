import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { ArtistProfileView } from "@/components/artist/artist-profile-view";
import { TrackView } from "@/components/tracking/track-view";
import { ArtistReplaysSection } from "@/components/live/artist-replays-section";

interface Props {
  params: { artistSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("full_name, story_html, location_city")
    .eq("slug", params.artistSlug)
    .single();

  if (!artist) return {};

  return {
    title: artist.full_name,
    description: artist.story_html
      ? artist.story_html.replace(/<[^>]*>/g, "").slice(0, 160)
      : `Découvrez les œuvres de ${artist.full_name} sur Bozzart`,
    openGraph: {
      title: artist.full_name,
      type: "profile",
    },
  };
}

export default async function ArtistProfilePage({ params }: Props) {
  const supabase = createSupabaseServerClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("*, profiles!inner(*)")
    .eq("slug", params.artistSlug)
    .single();

  if (!artist) notFound();

  const { data: artworks } = await supabase
    .from("artworks")
    .select("*")
    .eq("artist_id", artist.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: posts } = await supabase
    .from("carnet_posts")
    .select("*")
    .eq("artist_id", artist.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: replays } = await supabase
    .from("live_streams")
    .select("id, title, description, ended_at, recording_url, provider_playback_id")
    .eq("artist_id", artist.id)
    .eq("status", "ended")
    .order("ended_at", { ascending: false })
    .limit(24);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.full_name,
    url: `https://bozzart.art/${artist.slug}`,
    jobTitle: "Artiste",
    address: artist.location_city
      ? { "@type": "PostalAddress", addressLocality: artist.location_city, addressCountry: artist.location_country }
      : undefined,
    description: artist.story_html?.replace(/<[^>]*>/g, "").slice(0, 300),
    sameAs: [artist.website_url, artist.instagram_url].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script/gi, "<\\/script") }} />
      <TrackView type="profile" artistId={artist.id} />
      <ArtistProfileView
        artist={artist}
        artworks={artworks || []}
        posts={posts || []}
      />
      <ArtistReplaysSection replays={replays || []} />
    </>
  );
}
