"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Plan {
  id: string;
  artist_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  currency: string;
  benefits: string[];
  is_active: boolean;
  max_subscribers: number | null;
  created_at: string;
}

interface PlanWithCount extends Plan {
  subscriber_count: number;
}

const MIN_PRICE_CENTS = 300;
const MAX_PRICE_CENTS = 5000;
const MAX_PLANS = 3;

export default function SubscriptionsDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();

  const [plans, setPlans] = useState<PlanWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceEuros, setPriceEuros] = useState("5");
  const [benefitsText, setBenefitsText] = useState("");
  const [maxSubs, setMaxSubs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    void loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function loadPlans() {
    if (!user) return;
    setLoading(true);
    const { data: planRows, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("artist_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Impossible de charger les plans");
      setLoading(false);
      return;
    }

    const withCounts: PlanWithCount[] = await Promise.all(
      (planRows ?? []).map(async (p: any) => {
        const { count } = await supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("plan_id", p.id)
          .eq("status", "active");
        return {
          ...(p as Plan),
          benefits: Array.isArray(p.benefits) ? p.benefits : [],
          subscriber_count: count ?? 0,
        };
      }),
    );
    setPlans(withCounts);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPriceEuros("5");
    setBenefitsText("");
    setMaxSubs("");
  }

  function startEdit(p: PlanWithCount) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description ?? "");
    setPriceEuros(String((p.price_monthly / 100).toFixed(2)));
    setBenefitsText((p.benefits ?? []).join("\n"));
    setMaxSubs(p.max_subscribers != null ? String(p.max_subscribers) : "");
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const priceCents = Math.round(parseFloat(priceEuros) * 100);
    if (!Number.isFinite(priceCents) || priceCents < MIN_PRICE_CENTS || priceCents > MAX_PRICE_CENTS) {
      toast.error(`Prix entre ${MIN_PRICE_CENTS / 100} et ${MAX_PRICE_CENTS / 100} EUR`);
      return;
    }
    if (!name.trim()) {
      toast.error("Nom requis");
      return;
    }
    if (!editingId && plans.length >= MAX_PLANS) {
      toast.error(`Maximum ${MAX_PLANS} plans par artiste`);
      return;
    }

    const benefits = benefitsText
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    const payload = {
      artist_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      price_monthly: priceCents,
      benefits,
      max_subscribers: maxSubs.trim() ? parseInt(maxSubs, 10) : null,
      is_active: true,
    };

    setSaving(true);
    const res = editingId
      ? await supabase.from("subscription_plans").update(payload).eq("id", editingId)
      : await supabase.from("subscription_plans").insert(payload);
    setSaving(false);

    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editingId ? "Plan mis a jour" : "Plan cree");
    resetForm();
    void loadPlans();
  }

  async function deletePlan(id: string) {
    if (!confirm("Supprimer ce plan ? Les abonnes actifs resteront en base.")) return;
    const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Plan supprime");
    if (editingId === id) resetForm();
    void loadPlans();
  }

  async function togglePlanActive(p: PlanWithCount) {
    const { error } = await supabase
      .from("subscription_plans")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void loadPlans();
  }

  if (authLoading) {
    return <div className="p-8">Chargement...</div>;
  }
  if (!user) {
    return <div className="p-8">Connexion requise.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Abonnements</h1>
        <p className="text-sm text-neutral-600">
          Proposez a vos fans des plans recurrents (3 a 50 EUR / mois, max 3 plans).
        </p>
      </header>

      <section className="border rounded-lg p-5 bg-white">
        <h2 className="font-medium mb-4">
          {editingId ? "Modifier le plan" : "Creer un nouveau plan"}
        </h2>
        <form onSubmit={savePlan} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Nom</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="Atelier, Coulisses, Mecene..."
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Prix mensuel (EUR)</span>
              <input
                type="number"
                step="0.5"
                min="3"
                max="50"
                value={priceEuros}
                onChange={(e) => setPriceEuros(e.target.value)}
                required
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Max abonnes (vide = illimite)</span>
              <input
                type="number"
                min="1"
                value={maxSubs}
                onChange={(e) => setMaxSubs(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Avantages (un par ligne)</span>
            <textarea
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              rows={4}
              className="mt-1 w-full border rounded px-3 py-2 font-mono text-sm"
              placeholder={"Posts exclusifs\nAvant-premieres\nQ&A mensuel"}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {saving ? "..." : editingId ? "Mettre a jour" : "Creer le plan"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded border"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-medium mb-3">Vos plans</h2>
        {loading ? (
          <p className="text-sm text-neutral-500">Chargement...</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucun plan pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {plans.map((p) => (
              <li key={p.id} className="border rounded-lg p-4 bg-white flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    {!p.is_active && (
                      <span className="text-xs bg-neutral-200 px-2 py-0.5 rounded">inactif</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {(p.price_monthly / 100).toFixed(2)} {p.currency.toUpperCase()} / mois
                  </p>
                  {p.description && <p className="text-sm mt-1">{p.description}</p>}
                  {p.benefits.length > 0 && (
                    <ul className="mt-2 text-sm list-disc pl-5 text-neutral-700">
                      {p.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-neutral-500">
                    {p.subscriber_count} abonne{p.subscriber_count > 1 ? "s" : ""} actif
                    {p.subscriber_count > 1 ? "s" : ""}
                    {p.max_subscribers != null ? ` / ${p.max_subscribers}` : ""}
                    {" - "}
                    MRR estime : {((p.price_monthly * p.subscriber_count) / 100).toFixed(2)} EUR
                  </p>
                </div>
                <div className="flex md:flex-col gap-2">
                  <button onClick={() => startEdit(p)} className="px-3 py-1 rounded border text-sm">
                    Modifier
                  </button>
                  <button
                    onClick={() => togglePlanActive(p)}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    {p.is_active ? "Desactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => deletePlan(p.id)}
                    className="px-3 py-1 rounded border text-sm text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
