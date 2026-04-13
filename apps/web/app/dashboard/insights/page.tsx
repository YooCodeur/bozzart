import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export default async function BuyerInsightsPage() {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login?redirect=/dashboard/insights");

  const { data: insights } = await supabase
    .from("buyer_insights")
    .select("*")
    .eq("user_id", auth.user.id)
    .single();

  // Recommendations stub : top 5 artistes les plus suivis dans le medium favori
  const topMedium = (insights?.preferred_mediums || [])[0];
  let recommended: { id: string; slug: string; full_name: string }[] = [];
  if (topMedium) {
    const { data: recs } = await supabase
      .from("artworks")
      .select("artist:artist_profiles(id, slug, full_name)")
      .eq("medium", topMedium)
      .eq("status", "published")
      .limit(20);
    const seen = new Set<string>();
    for (const r of (recs || []) as { artist: { id: string; slug: string; full_name: string } | null }[]) {
      if (r.artist && !seen.has(r.artist.id)) {
        seen.add(r.artist.id);
        recommended.push(r.artist);
      }
    }
    recommended = recommended.slice(0, 5);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <h1 className="text-3xl font-bold">Vos insights</h1>
        <p className="mt-2 text-gray-600">Un aperçu de vos goûts et de votre activité sur Bozzart.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Artistes suivis" value={insights?.artists_followed_count ?? 0} />
          <Card label="Achats" value={insights?.purchase_count ?? 0} />
          <Card
            label="Budget wishlist moyen"
            value={insights?.avg_wishlist_price ? `${Number(insights.avg_wishlist_price).toFixed(0)} €` : "—"}
          />
          <Card
            label="Médium préféré"
            value={topMedium ? String(topMedium) : "—"}
          />
        </div>

        {(insights?.preferred_mediums || []).length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">Vos médiums préférés</h2>
            <div className="flex flex-wrap gap-2">
              {(insights!.preferred_mediums as string[]).map((m) => (
                <span key={m} className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize">{m}</span>
              ))}
            </div>
          </div>
        )}

        {recommended.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">Artistes que vous pourriez aimer</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {recommended.map((r) => (
                <li key={r.id}>
                  <Link href={`/${r.slug}`} className="rounded-lg border bg-background p-4 block hover:shadow">
                    <p className="font-medium">{r.full_name}</p>
                    <p className="text-xs text-gray-500">Recommandé d&apos;après vos goûts</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
