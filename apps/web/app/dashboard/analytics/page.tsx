"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { exportAnalyticsCsv } from "./actions";

interface TopArtwork {
  id: string;
  title: string;
  view_count: number;
  wishlist_count: number;
  price: number;
  price_currency: string;
}

interface AnalyticsRow {
  date: string;
  profile_views: number;
  artwork_views: number;
  new_followers: number;
  new_wishlists: number;
  messages_received: number;
  sales_count: number;
  sales_amount: number;
  discovery_impressions: number;
}

export default function AnalyticsPage() {
  const { artistProfile } = useAuth();
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [topArtworks, setTopArtworks] = useState<TopArtwork[]>([]);

  async function handleExportCsv() {
    if (!artistProfile) return;
    const { csv, error } = await exportAnalyticsCsv(artistProfile.id, period);
    if (error) {
      toast.error("Export impossible");
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bozzart-analytics-${period}j.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function fetchAnalytics() {
    if (!artistProfile) return;
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const since = new Date();
    since.setDate(since.getDate() - period);

    supabase
      .from("artist_analytics_daily")
      .select("*")
      .eq("artist_id", artistProfile.id)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: true })
      .then(({ data: rows, error }) => {
        if (error) {
          const msg = "Erreur lors du chargement des analytics.";
          setError(msg);
          toast.error(msg);
        } else {
          setData((rows as AnalyticsRow[]) || []);
        }
      });
  }

  useEffect(() => {
    fetchAnalytics();
    if (artistProfile) {
      const supabase = createSupabaseBrowserClient();
      supabase
        .from("artworks")
        .select("id, title, view_count, wishlist_count, price, price_currency")
        .eq("artist_id", artistProfile.id)
        .order("view_count", { ascending: false })
        .limit(5)
        .then(({ data: rows }) => setTopArtworks((rows as TopArtwork[]) || []));
    }
  }, [artistProfile, period]);

  const totals = data.reduce(
    (acc, d) => ({
      views: acc.views + d.profile_views + d.artwork_views,
      followers: acc.followers + d.new_followers,
      wishlists: acc.wishlists + d.new_wishlists,
      messages: acc.messages + d.messages_received,
      sales: acc.sales + d.sales_count,
      revenue: acc.revenue + d.sales_amount,
      discovery: acc.discovery + d.discovery_impressions,
    }),
    { views: 0, followers: 0, wishlists: 0, messages: 0, sales: 0, revenue: 0, discovery: 0 },
  );

  const displayCurrency = "EUR";

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    vues: d.profile_views + d.artwork_views,
    profil: d.profile_views,
    oeuvres: d.artwork_views,
    abonnes: d.new_followers,
    wishlists: d.new_wishlists,
    ventes: d.sales_count,
    ca: d.sales_amount,
    decouverte: d.discovery_impressions,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                period === p ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {p}j
            </button>
          ))}
          <button
            onClick={handleExportCsv}
            className="rounded-full bg-gray-100 px-4 py-1.5 text-sm hover:bg-gray-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Vues totales" value={totals.views} />
            <StatCard label="Nouveaux abonnés" value={totals.followers} />
            <StatCard label="Wishlists" value={totals.wishlists} />
            <StatCard label="Messages reçus" value={totals.messages} />
            <StatCard label="Ventes" value={totals.sales} />
            <StatCard label="Chiffre d'affaires" value={`${totals.revenue.toFixed(2)} ${displayCurrency}`} />
            <StatCard label="Impressions découverte" value={totals.discovery} />
            <StatCard
              label="Taux de découverte"
              value={totals.views > 0 ? `${Math.round((totals.discovery / totals.views) * 100)}%` : "—"}
            />
          </div>

          {/* Graphique vues */}
          {chartData.length > 0 && (
            <>
              <div className="mt-10">
                <h2 className="mb-4 text-lg font-semibold">Vues</h2>
                <div className="rounded-lg border bg-background p-4" style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="profil" stackId="1" stroke="#7e22ce" fill="#e9d5ff" name="Profil" />
                      <Area type="monotone" dataKey="oeuvres" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Œuvres" />
                      <Area type="monotone" dataKey="decouverte" stackId="1" stroke="#10b981" fill="#a7f3d0" name="Découverte" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique engagement */}
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold">Engagement</h2>
                <div className="rounded-lg border bg-background p-4" style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="abonnes" fill="#7e22ce" name="Abonnés" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="wishlists" fill="#f59e0b" name="Wishlists" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="ventes" fill="#10b981" name="Ventes" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique CA */}
              {totals.revenue > 0 && (
                <div className="mt-8">
                  <h2 className="mb-4 text-lg font-semibold">Chiffre d&apos;affaires</h2>
                  <div className="rounded-lg border bg-background p-4" style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [`${value} ${displayCurrency}`, "CA"]} />
                        <Area type="monotone" dataKey="ca" stroke="#10b981" fill="#a7f3d0" name="CA" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}

          {topArtworks.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-semibold">Top œuvres</h2>
              <div className="overflow-hidden rounded-lg border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Œuvre</th>
                      <th className="px-4 py-2">Vues</th>
                      <th className="px-4 py-2">Wishlists</th>
                      <th className="px-4 py-2">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topArtworks.map((a) => (
                      <tr key={a.id} className="border-t">
                        <td className="px-4 py-2">{a.title}</td>
                        <td className="px-4 py-2">{a.view_count}</td>
                        <td className="px-4 py-2">{a.wishlist_count}</td>
                        <td className="px-4 py-2">{a.price} {a.price_currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
