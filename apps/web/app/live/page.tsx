import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lives — Bozzart",
  description: "Sessions live atelier des artistes Bozzart en direct et à venir.",
};

interface Row {
  id: string;
  title: string;
  description: string | null;
  status: "scheduled" | "live" | "ended" | "canceled";
  scheduled_at: string | null;
  started_at: string | null;
  artist_id: string;
  artist_profiles: { full_name: string; slug: string } | null;
}

export default async function LiveDiscoveryPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("live_streams")
    .select("id,title,description,status,scheduled_at,started_at,artist_id, artist_profiles!inner(full_name,slug)")
    .in("status", ["live", "scheduled"])
    .order("status", { ascending: true }) // 'live' < 'scheduled' lexicographically
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .limit(60);

  const rows = ((data as unknown) as Row[]) ?? [];
  // Sort: live first, then scheduled by time ascending
  rows.sort((a, b) => {
    if (a.status !== b.status) return a.status === "live" ? -1 : 1;
    const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0;
    const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0;
    return ta - tb;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Lives</h1>
      <p className="mt-1 text-gray-600">En direct et à venir dans les ateliers.</p>

      {rows.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucun live pour le moment.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <Link
              key={s.id}
              href={`/live/${s.id}`}
              className="group rounded-lg border bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                {s.status === "live" && (
                  <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    DIRECT
                  </span>
                )}
                {s.status === "scheduled" && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    À venir
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-semibold group-hover:underline">{s.title}</h3>
              {s.artist_profiles && (
                <p className="text-sm text-gray-600">{s.artist_profiles.full_name}</p>
              )}
              {s.scheduled_at && s.status === "scheduled" && (
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(s.scheduled_at).toLocaleString("fr-FR")}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
