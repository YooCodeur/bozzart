import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { EmbedSnippet } from "@/components/referrals/embed-snippet";

interface Props {
  params: { id: string };
}

export const metadata = {
  title: "Widget embed — Bozzart",
};

export default async function ArtworkEmbedDashboardPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: artwork } = await supabase
    .from("artworks")
    .select("id, title, artist:artist_profiles(user_id)")
    .eq("id", params.id)
    .maybeSingle();

  if (!artwork) notFound();
  const artist = artwork.artist as unknown as { user_id: string };
  if (artist.user_id !== user.id) redirect("/dashboard/artworks");

  const embedUrl = `https://bozzart.com/embed/artwork/${artwork.id}`;
  const snippet = `<iframe src="${embedUrl}" width="360" height="520" style="border:0;max-width:100%" loading="lazy" title="${artwork.title.replace(/"/g, "&quot;")} — Bozzart"></iframe>`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold">Widget embed</h1>
      <p className="mt-2 text-sm text-gray-500">
        Collez ce code HTML sur votre site personnel pour afficher l&apos;œuvre
        <strong className="mx-1">{artwork.title}</strong> avec un lien vers Bozzart.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Code à copier</h2>
        <EmbedSnippet snippet={snippet} />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Aperçu</h2>
        <iframe
          src={embedUrl}
          width={360}
          height={520}
          style={{ border: 0, maxWidth: "100%" }}
          loading="lazy"
          title={`${artwork.title} — Bozzart`}
        />
      </section>
    </main>
  );
}
