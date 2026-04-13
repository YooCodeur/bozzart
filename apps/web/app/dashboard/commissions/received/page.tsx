"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Commission {
  id: string;
  title: string;
  brief: string;
  status: string;
  budget_cents: number | null;
  artist_price_cents: number | null;
  artist_notes: string | null;
  deadline: string | null;
  delivery_url: string | null;
  reference_images: string[];
  created_at: string;
  buyer: { full_name: string | null } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "À traiter",
  accepted: "Devis envoyé",
  declined: "Refusée",
  in_progress: "En cours",
  delivered: "Livrée",
  completed: "Terminée",
  canceled: "Annulée",
};

export default function ArtistReceivedCommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [deliveryInput, setDeliveryInput] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("commissions")
      .select("id, title, brief, status, budget_cents, artist_price_cents, artist_notes, deadline, delivery_url, reference_images, created_at, buyer:profiles!commissions_buyer_id_fkey(full_name)")
      .eq("artist_id", user.id)
      .order("created_at", { ascending: false });
    setCommissions((data as unknown as Commission[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, patch: Record<string, unknown>) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("commissions").update(patch).eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setEditing(null);
    setPriceInput("");
    setNotesInput("");
    setDeliveryInput("");
    await load();
  }

  function startAccept(c: Commission) {
    setEditing(c.id);
    setPriceInput(c.artist_price_cents ? (c.artist_price_cents / 100).toString() : "");
    setNotesInput(c.artist_notes ?? "");
  }

  async function submitAccept(id: string) {
    const cents = Math.round(parseFloat(priceInput) * 100);
    if (!cents || cents <= 0) {
      alert("Prix invalide");
      return;
    }
    await updateStatus(id, {
      status: "accepted",
      artist_price_cents: cents,
      artist_notes: notesInput || null,
    });
  }

  async function submitDelivery(id: string) {
    if (!deliveryInput) {
      alert("URL de livraison requise");
      return;
    }
    await updateStatus(id, {
      status: "delivered",
      delivery_url: deliveryInput,
    });
  }

  if (!user) return <div className="p-8 text-gray-500">Connexion requise.</div>;
  if (loading) return <div className="p-8 text-gray-500">Chargement…</div>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Commandes reçues</h1>

      {commissions.length === 0 ? (
        <p className="mt-6 text-gray-500">Aucune demande pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {commissions.map((c) => (
            <li key={c.id} className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{c.title}</h2>
                  <p className="text-sm text-gray-500">
                    de {c.buyer?.full_name ?? "Acheteur"} ·{" "}
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{c.brief}</p>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {c.budget_cents !== null && (
                  <div>
                    <dt className="text-gray-500">Budget acheteur</dt>
                    <dd>{(c.budget_cents / 100).toFixed(2)} €</dd>
                  </div>
                )}
                {c.deadline && (
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd>{new Date(c.deadline).toLocaleDateString()}</dd>
                  </div>
                )}
                {c.artist_price_cents !== null && (
                  <div>
                    <dt className="text-gray-500">Votre devis</dt>
                    <dd>{(c.artist_price_cents / 100).toFixed(2)} €</dd>
                  </div>
                )}
              </dl>

              {c.reference_images.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {c.reference_images.length} image(s) de référence fournies
                </p>
              )}

              {/* Actions per status */}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.status === "pending" && editing !== c.id && (
                  <>
                    <button
                      onClick={() => startAccept(c)}
                      className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
                    >
                      Accepter et proposer un prix
                    </button>
                    <button
                      onClick={() => updateStatus(c.id, { status: "declined" })}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      Refuser
                    </button>
                  </>
                )}

                {c.status === "accepted" && (
                  <p className="text-xs text-gray-500">
                    En attente du paiement de l&apos;acheteur.
                  </p>
                )}

                {c.status === "in_progress" && editing !== c.id && (
                  <button
                    onClick={() => {
                      setEditing(c.id);
                      setDeliveryInput("");
                    }}
                    className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
                  >
                    Marquer comme livrée
                  </button>
                )}

                {c.status === "delivered" && c.delivery_url && (
                  <a
                    href={c.delivery_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    Voir la livraison
                  </a>
                )}
              </div>

              {/* Inline form: accept w/ price */}
              {editing === c.id && c.status === "pending" && (
                <div className="mt-4 space-y-3 rounded-md bg-gray-50 p-4">
                  <div>
                    <label htmlFor={`price-${c.id}`} className="block text-sm font-medium">
                      Prix proposé (€)
                    </label>
                    <input
                      id={`price-${c.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor={`notes-${c.id}`} className="block text-sm font-medium">
                      Note pour l&apos;acheteur
                    </label>
                    <textarea
                      id={`notes-${c.id}`}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitAccept(c.id)}
                      className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
                    >
                      Envoyer le devis
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-md border px-3 py-1.5 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Inline form: mark delivered */}
              {editing === c.id && c.status === "in_progress" && (
                <div className="mt-4 space-y-3 rounded-md bg-gray-50 p-4">
                  <div>
                    <label htmlFor={`delivery-${c.id}`} className="block text-sm font-medium">
                      URL de livraison (fichier, galerie privée…)
                    </label>
                    <input
                      id={`delivery-${c.id}`}
                      type="url"
                      value={deliveryInput}
                      onChange={(e) => setDeliveryInput(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitDelivery(c.id)}
                      className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
                    >
                      Confirmer la livraison
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-md border px-3 py-1.5 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
