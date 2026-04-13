"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface TxRow {
  paid_at: string;
  platform_fee: number;
  artist_amount: number;
  amount: number;
}

interface BoostRow {
  created_at: string;
  price_cents: number;
}

export default function RevenueRecapPage() {
  const { artistProfile } = useAuth();
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [boosts, setBoosts] = useState<BoostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistProfile) return;
    const supabase = createSupabaseBrowserClient();
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

    Promise.all([
      supabase
        .from("transactions")
        .select("paid_at, platform_fee, artist_amount, amount")
        .eq("artist_id", artistProfile.id)
        .eq("status", "completed")
        .gte("paid_at", yearStart),
      supabase
        .from("artwork_boosts")
        .select("created_at, price_cents")
        .eq("artist_id", artistProfile.id)
        .in("status", ["active", "ended"])
        .gte("created_at", yearStart),
    ])
      .then(([txRes, boostRes]) => {
        if (txRes.error) toast.error("Erreur chargement revenus");
        else setTransactions((txRes.data as TxRow[]) || []);
        if (!boostRes.error) setBoosts((boostRes.data as BoostRow[]) || []);
      })
      .finally(() => setLoading(false));
  }, [artistProfile]);

  const totals = useMemo(() => {
    const salesNet = transactions.reduce((s, t) => s + Number(t.artist_amount || 0), 0);
    const gross = transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
    const commissionsPaid = transactions.reduce(
      (s, t) => s + Number(t.platform_fee || 0),
      0,
    );
    const boostsSpent = boosts.reduce((s, b) => s + b.price_cents / 100, 0);
    // Phases 18/19/20 : ces revenus seront chainés lorsqu'ils existeront
    const subscriptionsNet = 0;
    const customOrdersNet = 0;
    const printMargins = 0;
    const totalYtd =
      salesNet + subscriptionsNet + customOrdersNet + printMargins - boostsSpent;
    return {
      gross,
      salesNet,
      commissionsPaid,
      subscriptionsNet,
      customOrdersNet,
      printMargins,
      boostsSpent,
      totalYtd,
    };
  }, [transactions, boosts]);

  const chartData = useMemo(() => {
    const byMonth = new Map<string, { mois: string; ventes: number; boosts: number }>();
    for (let m = 0; m < 12; m++) {
      const key = new Date(new Date().getFullYear(), m, 1)
        .toLocaleDateString("fr-FR", { month: "short" });
      byMonth.set(String(m), { mois: key, ventes: 0, boosts: 0 });
    }
    transactions.forEach((t) => {
      if (!t.paid_at) return;
      const m = String(new Date(t.paid_at).getMonth());
      const row = byMonth.get(m)!;
      row.ventes += Number(t.artist_amount || 0);
    });
    boosts.forEach((b) => {
      const m = String(new Date(b.created_at).getMonth());
      const row = byMonth.get(m)!;
      row.boosts += b.price_cents / 100;
    });
    return Array.from(byMonth.values());
  }, [transactions, boosts]);

  if (!artistProfile) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">Profil artiste requis pour voir ce recap.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Revenus</h1>
      <p className="mt-1 text-sm text-gray-500">
        Recap annuel (YTD) de toutes vos sources de revenus sur Bozzart.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Chargement…</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Ventes d'oeuvres (net)" value={fmt(totals.salesNet)} hint="Apres commission 10%" />
            <Card label="Abonnements (net)" value={fmt(totals.subscriptionsNet)} hint="Phase 18" />
            <Card label="Commandes personnalisees" value={fmt(totals.customOrdersNet)} hint="Phase 19" />
            <Card label="Print-on-demand" value={fmt(totals.printMargins)} hint="Phase 20" />
            <Card label="Depenses en boosts" value={`- ${fmt(totals.boostsSpent)}`} />
            <Card label="Commission plateforme" value={fmt(totals.commissionsPaid)} hint="Payee a Bozzart" />
            <Card label="CA brut" value={fmt(totals.gross)} />
            <Card label="Total YTD (net)" value={fmt(totals.totalYtd)} highlight />
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">Evolution mensuelle</h2>
            <div className="rounded-lg border bg-background p-4" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} EUR`} />
                  <Legend />
                  <Area type="monotone" dataKey="ventes" name="Ventes" stroke="#10b981" fill="#a7f3d0" />
                  <Area type="monotone" dataKey="boosts" name="Boosts" stroke="#f59e0b" fill="#fde68a" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function fmt(n: number) {
  return `${n.toFixed(2)} EUR`;
}

function Card({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        highlight ? "border-black bg-black text-white" : "bg-background"
      }`}
    >
      <p className={`text-sm ${highlight ? "text-gray-300" : "text-gray-500"}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && (
        <p className={`mt-1 text-xs ${highlight ? "text-gray-400" : "text-gray-400"}`}>{hint}</p>
      )}
    </div>
  );
}
