import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export const metadata: Metadata = {
  title: "Tendances du marché de l'art contemporain — Bozzart",
  description:
    "Découvrez les tendances du marché de l'art contemporain : médiums populaires, prix médians et croissance hebdomadaire.",
};

export const revalidate = 3600;

interface TrendRow {
  medium: string;
  week_start: string;
  tx_count: number;
  median_price: number | null;
  trending_score: number | null;
}

export default async function TrendsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("market_trends_weekly")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(200);

  const rows = (data || []) as TrendRow[];
  // garder la derniere semaine par medium
  const latestByMedium = new Map<string, TrendRow>();
  for (const r of rows) {
    if (!latestByMedium.has(r.medium)) latestByMedium.set(r.medium, r);
  }

  const mediums = Array.from(latestByMedium.values());

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h1 className="text-3xl font-bold">Tendances du marché</h1>
        <p className="mt-2 text-gray-600">
          Médiums populaires, prix médians et croissance hebdomadaire sur Bozzart.
        </p>

        {mediums.length === 0 ? (
          <p className="mt-12 text-gray-500">Pas encore assez de données.</p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mediums.map((m) => (
              <Link
                key={m.medium}
                href={`/trends/${m.medium}`}
                className="rounded-lg border bg-background p-6 transition hover:shadow"
              >
                <h2 className="text-lg font-semibold capitalize">{m.medium}</h2>
                <p className="mt-2 text-2xl font-bold">
                  {m.median_price ? `${Number(m.median_price).toFixed(0)} €` : "—"}
                </p>
                <p className="text-xs text-gray-500">Prix médian (7j)</p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <TrendArrow score={m.trending_score} />
                  <span className="text-gray-600">{m.tx_count} ventes</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TrendArrow({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-400">—</span>;
  if (score > 0) return <span className="text-green-600">↑ {score}%</span>;
  if (score < 0) return <span className="text-red-600">↓ {Math.abs(score)}%</span>;
  return <span className="text-gray-500">→ 0%</span>;
}
