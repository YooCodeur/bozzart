import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { MediumSparkline } from "./sparkline";

interface Props {
  params: { medium: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Tendances ${params.medium} — Bozzart`,
    description: `Tendances du marché pour ${params.medium} : évolution du prix médian et du volume de ventes.`,
  };
}

export const revalidate = 3600;

export default async function MediumTrendPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("market_trends_weekly")
    .select("*")
    .eq("medium", params.medium)
    .order("week_start", { ascending: false })
    .limit(12);

  const rows = (data || []).slice().reverse();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <h1 className="text-3xl font-bold capitalize">{params.medium}</h1>
        <p className="mt-2 text-gray-600">12 dernières semaines</p>

        {rows.length === 0 ? (
          <p className="mt-10 text-gray-500">Pas encore assez de données.</p>
        ) : (
          <div className="mt-10 rounded-lg border bg-background p-4" style={{ height: 300 }}>
            <MediumSparkline data={rows} />
          </div>
        )}
      </div>
    </main>
  );
}
