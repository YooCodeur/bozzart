import { notFound } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

interface Props {
  params: { artworkId: string };
}

export const metadata = {
  robots: { index: false, follow: false },
};

// Minimal page — no header / no nav
export default async function ArtworkEmbedPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: artwork } = await supabase
    .from("artworks")
    .select("id, title, slug, primary_image_url, artist:artist_profiles(slug, full_name)")
    .eq("id", params.artworkId)
    .eq("status", "published")
    .maybeSingle();

  if (!artwork) notFound();

  const artist = artwork.artist as unknown as { slug: string; full_name: string };
  const publicUrl = `https://bozzart.com/${artist.slug}/artwork/${artwork.slug}`;

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff" }}>
        <main style={{ padding: 16, textAlign: "center" }}>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Image
              src={artwork.primary_image_url}
              alt={artwork.title}
              width={600}
              height={600}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }}
              unoptimized
            />
          </a>
          <div style={{ marginTop: 12, fontSize: 14, color: "#111" }}>
            <strong>{artwork.title}</strong>
            <div style={{ color: "#666" }}>{artist.full_name}</div>
          </div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "8px 16px",
              background: "#000",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            Voir sur Bozzart
          </a>
        </main>
      </body>
    </html>
  );
}
