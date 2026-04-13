"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Row {
  date: string;
  commission_revenue_cents: number;
  commission_count: number;
  subscription_revenue_cents: number;
  commission_feature_revenue_cents: number;
  print_revenue_cents: number;
  boost_revenue_cents: number;
  boost_count: number;
  total_cents: number;
}

const TVA_THRESHOLD_EUR = 36_800;
const MICRO_CAP_EUR = 77_700;

export default function AdminRevenuePage() {
  const { profile, isLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase
      .rpc("get_platform_revenue_daily", { p_days: 90 })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          toast.error("Acces refuse ou erreur chargement.");
        } else {
          setRows((data as Row[]) || []);
        }
      })
      .then(() => setLoading(false));
  }, [isLoading, isAdmin]);

  const chartData = useMemo(
    () =>
      [...rows]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({
          date: new Date(r.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
          }),
          ventes: r.commission_revenue_cents / 100,
          abonnements: r.subscription_revenue_cents / 100,
          commandes: r.commission_feature_revenue_cents / 100,
          print: r.print_revenue_cents / 100,
          boosts: r.boost_revenue_cents / 100,
        })),
    [rows],
  );

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        ventes: acc.ventes + r.commission_revenue_cents,
        abonnements: acc.abonnements + r.subscription_revenue_cents,
        commandes: acc.commandes + r.commission_feature_revenue_cents,
        print: acc.print + r.print_revenue_cents,
        boosts: acc.boosts + r.boost_revenue_cents,
        total: acc.total + r.total_cents,
      }),
      { ventes: 0, abonnements: 0, commandes: 0, print: 0, boosts: 0, total: 0 },
    );
  }, [rows]);

  const totalEur = totals.total / 100;
  const tvaPct = Math.min(100, Math.round((totalEur / TVA_THRESHOLD_EUR) * 100));
  const microPct = Math.min(100, Math.round((totalEur / MICRO_CAP_EUR) * 100));

  function exportCsv() {
    const header =
      "date,commission_cents,subscription_cents,custom_orders_cents,print_cents,boost_cents,total_cents";
    const lines = rows.map(
      (r) =>
        `${r.date},${r.commission_revenue_cents},${r.subscription_revenue_cents},${r.commission_feature_revenue_cents},${r.print_revenue_cents},${r.boost_revenue_cents},${r.total_cents}`,
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bozzart-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading || loading) {
    return <div className="p-8 text-sm text-gray-500">Chargement…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Acces refuse</h1>
        <p className="mt-2 text-sm text-gray-500">
          Cette page est reservee aux administrateurs de la plateforme.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revenus plateforme</h1>
        <button
          onClick={exportCsv}
          className="rounded-md border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Card label="Ventes (commission)" value={fmt(totals.ventes)} />
        <Card label="Abonnements" value={fmt(totals.abonnements)} />
        <Card label="Commandes" value={fmt(totals.commandes)} />
        <Card label="Print" value={fmt(totals.print)} />
        <Card label="Boosts" value={fmt(totals.boosts)} />
        <Card label="Total 90j" value={fmt(totals.total)} highlight />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Threshold label={`Seuil TVA (${TVA_THRESHOLD_EUR} EUR)`} pct={tvaPct} />
        <Threshold label={`Plafond micro (${MICRO_CAP_EUR} EUR)`} pct={microPct} />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Revenus — 90 derniers jours</h2>
        <div className="rounded-lg border bg-background p-4" style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)} EUR`} />
              <Legend />
              <Area type="monotone" stackId="1" dataKey="ventes" name="Ventes" stroke="#10b981" fill="#a7f3d0" />
              <Area type="monotone" stackId="1" dataKey="abonnements" name="Abonnements" stroke="#7e22ce" fill="#e9d5ff" />
              <Area type="monotone" stackId="1" dataKey="commandes" name="Commandes" stroke="#3b82f6" fill="#bfdbfe" />
              <Area type="monotone" stackId="1" dataKey="print" name="Print" stroke="#ef4444" fill="#fecaca" />
              <Area type="monotone" stackId="1" dataKey="boosts" name="Boosts" stroke="#f59e0b" fill="#fde68a" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <h2 className="mb-4 text-lg font-semibold">Detail journalier</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">Date</th>
              <th className="p-2">Ventes</th>
              <th className="p-2">Abo.</th>
              <th className="p-2">Commandes</th>
              <th className="p-2">Print</th>
              <th className="p-2">Boosts</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="border-b">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{fmt(r.commission_revenue_cents)}</td>
                <td className="p-2">{fmt(r.subscription_revenue_cents)}</td>
                <td className="p-2">{fmt(r.commission_feature_revenue_cents)}</td>
                <td className="p-2">{fmt(r.print_revenue_cents)}</td>
                <td className="p-2">{fmt(r.boost_revenue_cents)}</td>
                <td className="p-2 text-right font-medium">{fmt(r.total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(cents: number) {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function Card({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "border-black bg-black text-white" : "bg-background"
      }`}
    >
      <p className={`text-xs ${highlight ? "text-gray-300" : "text-gray-500"}`}>{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function Threshold({ label, pct }: { label: string; pct: number }) {
  const color = pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
