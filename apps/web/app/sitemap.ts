import { type MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Regenerer toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Pendant le build sans env vars, retourner juste les pages statiques
  if (!supabaseUrl || !supabaseKey) {
    return [
      { url: "https://bozzart.art", lastModified: new Date(), priority: 1 },
      { url: "https://bozzart.art/discover", lastModified: new Date(), priority: 0.9 },
      { url: "https://bozzart.art/artists", lastModified: new Date(), priority: 0.8 },
    ];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://bozzart.art", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://bozzart.art/discover", lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: "https://bozzart.art/artists", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://bozzart.art/drops", lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  // Profils artistes
  const { data: artists } = await supabase
    .from("artist_profiles")
    .select("slug, updated_at");

  const artistPages: MetadataRoute.Sitemap = (artists || []).map((artist) => ({
    url: `https://bozzart.art/${artist.slug}`,
    lastModified: new Date(artist.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Oeuvres publiees
  const { data: artworks } = await supabase
    .from("artworks")
    .select("slug, updated_at, artist:artist_profiles(slug)")
    .eq("status", "published");

  const artworkPages: MetadataRoute.Sitemap = (artworks || []).map((artwork) => ({
    url: `https://bozzart.art/${(artwork.artist as unknown as { slug: string }).slug}/artwork/${artwork.slug}`,
    lastModified: new Date(artwork.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...artistPages, ...artworkPages];
}
