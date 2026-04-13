"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Commission {
  id: string;
  title: string;
  status: string;
  budget_cents: number | null;
  artist_price_cents: number | null;
  artist_notes: string | null;
  deadline: string | null;
  created_at: string;
  artist: { full_name: string; slug: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Devis reçu",
  declined: "Refusée",
  in_progress: "En cours",
  delivered: "Livrée",
  completed: "Terminée",
  canceled: "Annulée",
};

export default function BuyerCommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("commissions")
      .select("id, title, status, budget_cents, artist_price_cents, artist_notes, deadline, created_at, artist:profiles!commissions_artist_id_fkey(full_name, slug)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCommissions((data as unknown as Commission[]) || []);
        setLoading(false);
      });
  }, [user]);

  async function handleAcceptQuote(commissionId: string) {
    setPayingId(commissionId);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/commission-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
          },
          body: JSON.stringify({ commission_id: commissionId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur Stripe");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inattendue");
      setPayingId(null);
    }
  }

  if (!user) {
    return <div className="p-8 text-gray-500">Connexion requise.</div>;
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Chargement…</div>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Mes commandes personnalisées</h1>

      {commissions.length === 0 ? (
        <p className="mt-6 text-gray-500">Aucune commande pour l&apos;instant.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {commissions.map((c) => (
            <li key={c.id} className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{c.title}</h2>
                  {c.artist && (
                    <p className="text-sm text-gray-500">
                      avec{" "}
                      <Link href={`/${c.artist.slug}`} className="underline">
                        {c.artist.full_name}
                      </Link>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {c.budget_cents !== null && (
                  <div>
                    <dt className="text-gray-500">Budget indicatif</dt>
                    <dd>{(c.budget_cents / 100).toFixed(2)} €</dd>
                  </div>
                )}
                {c.artist_price_cents !== null && (
                  <div>
                    <dt className="text-gray-500">Devis artiste</dt>
                    <dd className="font-semibold">{(c.artist_price_cents / 100).toFixed(2)} €</dd>
                  </div>
                )}
                {c.deadline && (
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd>{new Date(c.deadline).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>

              {c.artist_notes && (
                <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-700">
                  <span className="font-medium">Note artiste :</span> {c.artist_notes}
                </p>
              )}

              {c.status === "accepted" && c.artist_price_cents !== null && (
                <button
                  onClick={() => handleAcceptQuote(c.id)}
                  disabled={payingId === c.id}
                  className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {payingId === c.id ? "Redirection…" : "Accepter le devis et payer"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
