import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

interface Props {
  params: { theme: string };
}

// Map of URL slug → { medium enum value (if any), tag fallback, display name, meta description }
const THEMES: Record<
  string,
  { medium?: string; tag?: string; title: string; description: string }
> = {
  "street-art": {
    tag: "street-art",
    title: "Street Art",
    description:
      "Découvrez le meilleur du street art contemporain : fresques, pochoirs et œuvres urbaines signées d'artistes émergents.",
  },
  abstract: {
    tag: "abstrait",
    title: "Art abstrait",
    description:
      "Œuvres abstraites contemporaines : peintures, illustrations et compositions non figuratives.",
  },
  photography: {
    medium: "photography",
    title: "Photographie d'art",
    description:
      "Tirages photographiques originaux et éditions limitées d'artistes photographes.",
  },
  painting: {
    medium: "painting",
    title: "Peinture",
    description:
      "Peintures originales : huile, acrylique, aquarelle par des artistes contemporains.",
  },
  sculpture: {
    medium: "sculpture",
    title: "Sculpture",
    description: "Sculptures contemporaines originales, toutes matières.",
  },
  illustration: {
    medium: "illustration",
    title: "Illustration",
    description: "Illustrations originales et éditions d'art.",
  },
  drawing: {
    medium: "drawing",
    title: "Dessin",
    description: "Dessins originaux au fusain, à l'encre, au crayon.",
  },
  digital: {
    medium: "digital",
    title: "Art numérique",
    description: "Créations numériques originales et tirages d'art.",
  },
  print: {
    medium: "print",
    title: "Estampes & gravures",
    description: "Estampes, sérigraphies et gravures en édition limitée.",
  },
};

function resolveTheme(slug: string) {
  const known = THEMES[slug];
  if (known) return known;
  // Accept any slug as a free-form tag search
  return {
    tag: slug,
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: `Œuvres autour de "${slug}" sur Bozzart.`,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const theme = resolveTheme(params.theme);
  return {
    title: `${theme.title} — Bozzart`,
    description: theme.description,
    openGraph: {
      title: `${theme.title} — Bozzart`,
      description: theme.description,
      type: "website",
    },
    alternates: {
      canonical: `/explore/${params.theme}`,
    },
  };
}

export default async function ExploreThemePage({ params }: Props) {
  const theme = resolveTheme(params.theme);
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("artworks")
    .select("id, title, slug, primary_image_url, price, price_currency, artist:artist_profiles(slug, full_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(48);

  if (theme.medium) {
    query = query.eq("medium", theme.medium);
  } else if (theme.tag) {
    query = query.contains("tags", [theme.tag]);
  }

  const { data: artworks } = await query;

  if (!artworks || artworks.length === 0) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          {theme.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-500">{theme.description}</p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artworks.map((a) => {
          const artist = a.artist as unknown as { slug: string; full_name: string };
          return (
            <Link
              key={a.id}
              href={`/${artist.slug}/artwork/${a.slug}`}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={a.primary_image_url}
                  alt={a.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="mt-2 text-sm">
                <p className="font-medium text-black truncate">{a.title}</p>
                <p className="text-xs text-gray-500 truncate">{artist.full_name}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
