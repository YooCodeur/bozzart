"use server";

import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export async function exportAnalyticsCsv(artistId: string, days: number) {
  const supabase = createSupabaseServerClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("artist_analytics_daily")
    .select("*")
    .eq("artist_id", artistId)
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) return { csv: "", error: error.message };

  const rows = (data || []) as Record<string, unknown>[];
  if (rows.length === 0) return { csv: "date\n", error: null };

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  return { csv: lines.join("\n"), error: null };
}
