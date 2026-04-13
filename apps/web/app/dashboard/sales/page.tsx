"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface TransactionRow {
  id: string;
  amount: number;
  platform_fee: number;
  artist_amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  transferred_at: string | null;
  payout_at: string | null;
  guest_email: string | null;
  guest_name: string | null;
  created_at: string;
  artwork: { title: string; primary_image_url: string };
  buyer: { display_name: string } | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "En cours", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completee", color: "bg-green-100 text-green-700" },
  failed: { label: "Echouee", color: "bg-red-100 text-red-700" },
  refunded: { label: "Remboursee", color: "bg-gray-100 text-gray-700" },
};

export default function SalesPage() {
  const { artistProfile } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  function fetchTransactions() {
    if (!artistProfile) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from("transactions")
      .select("*, artwork:artworks(title, primary_image_url), buyer:profiles(display_name)")
      .eq("artist_id", artistProfile.id)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    query.then(({ data, error }) => {
      if (error) {
        const msg = "Erreur lors du chargement des ventes.";
        setError(msg);
        toast.error(msg);
      } else {
        setTransactions((data as unknown as TransactionRow[]) || []);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchTransactions();
  }, [artistProfile, filter]);

  const completedTransactions = transactions.filter((t) => t.status === "completed");
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.artist_amount, 0);
  const displayCurrency = completedTransactions[0]?.currency || transactions[0]?.currency || "EUR";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Ventes</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-lg border bg-background p-6">
          <p className="text-sm text-gray-500">Total ventes</p>
          <p className="mt-1 text-2xl font-bold">{completedTransactions.length}</p>
        </div>
        <div className="rounded-lg border bg-background p-6">
          <p className="text-sm text-gray-500">Chiffre d&apos;affaires (net)</p>
          <p className="mt-1 text-2xl font-bold">{totalRevenue.toFixed(2)} {displayCurrency}</p>
        </div>
        <div className="rounded-lg border bg-background p-6">
          <p className="text-sm text-gray-500">En attente de virement</p>
          <p className="mt-1 text-2xl font-bold">
            {transactions.filter((t) => t.status === "completed" && !t.payout_at).reduce((s, t) => s + t.artist_amount, 0).toFixed(2)} {displayCurrency}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex gap-2">
        {["all", "completed", "pending", "processing", "failed"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); }}
            className={`rounded-full px-4 py-1.5 text-sm transition ${filter === s ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            {s === "all" ? "Toutes" : statusLabels[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Liste */}
      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Reessayer
          </button>
        </div>
      ) : loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : transactions.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucune transaction.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Liste des ventes</caption>
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th scope="col" className="py-3 pr-4">Oeuvre</th>
                <th scope="col" className="py-3 pr-4">Acheteur</th>
                <th scope="col" className="py-3 pr-4">Montant</th>
                <th scope="col" className="py-3 pr-4">Commission</th>
                <th scope="col" className="py-3 pr-4">Net</th>
                <th scope="col" className="py-3 pr-4">Statut</th>
                <th scope="col" className="py-3 pr-4">Virement</th>
                <th scope="col" className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-3 pr-4 font-medium">{tx.artwork.title}</td>
                  <td className="py-3 pr-4 text-gray-600">{tx.buyer?.display_name || tx.guest_name || tx.guest_email || "Guest"}</td>
                  <td className="py-3 pr-4">{tx.amount} {tx.currency}</td>
                  <td className="py-3 pr-4 text-gray-500">{tx.platform_fee} {tx.currency}</td>
                  <td className="py-3 pr-4 font-medium">{tx.artist_amount} {tx.currency}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusLabels[tx.status]?.color || "bg-gray-100"}`}>
                      {statusLabels[tx.status]?.label || tx.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {tx.payout_at ? (
                      <span className="text-green-600 text-xs">Vire</span>
                    ) : tx.transferred_at ? (
                      <span className="text-yellow-600 text-xs">En transit</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-400">{new Date(tx.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
