"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface PublicPlan {
  id: string;
  artist_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  currency: string;
  benefits: string[];
  max_subscribers: number | null;
  subscriber_count: number;
}

interface Props {
  artistId: string;
  artistName: string;
  plans: PublicPlan[];
}

export function SupportArtistSection({ artistId, artistName, plans }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams?.get("subscribe");
    if (status === "success") {
      toast.success(`Merci pour votre soutien a ${artistName} !`);
    } else if (status === "cancel") {
      toast.info("Abonnement annule");
    }
  }, [searchParams, artistName]);

  if (!plans || plans.length === 0) return null;

  async function subscribe(planId: string) {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname ?? "/")}`);
      return;
    }
    setLoadingPlanId(planId);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const returnUrl = `${origin}${pathname ?? "/"}`;
      const { data, error } = await supabase.functions.invoke("subscribe-to-artist", {
        body: { plan_id: planId, return_url: returnUrl },
      });
      if (error) throw error;
      const url = (data as { checkout_url?: string })?.checkout_url;
      if (!url) throw new Error("No checkout URL");
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(`Impossible de demarrer l'abonnement : ${msg}`);
      setLoadingPlanId(null);
    }
  }

  return (
    <section className="border rounded-lg p-5 bg-white my-6">
      <h2 className="text-lg font-semibold">Soutenir {artistName}</h2>
      <p className="text-sm text-neutral-600 mt-1">
        Abonnez-vous pour acceder au contenu exclusif et soutenir la creation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {plans.map((p) => {
          const full = p.max_subscribers != null && p.subscriber_count >= p.max_subscribers;
          return (
            <div key={p.id} className="border rounded-lg p-4 flex flex-col">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-2xl font-bold mt-1">
                {(p.price_monthly / 100).toFixed(2)} {p.currency.toUpperCase()}
                <span className="text-sm font-normal text-neutral-500"> / mois</span>
              </p>
              {p.description && <p className="text-sm mt-2 text-neutral-700">{p.description}</p>}
              {p.benefits.length > 0 && (
                <ul className="mt-3 text-sm space-y-1 text-neutral-800 list-disc pl-5">
                  {p.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-neutral-500">
                Rejoint par {p.subscriber_count} personne{p.subscriber_count > 1 ? "s" : ""}
                {p.max_subscribers != null ? ` / ${p.max_subscribers}` : ""}
              </p>
              <button
                type="button"
                disabled={loadingPlanId === p.id || full}
                onClick={() => subscribe(p.id)}
                className="mt-4 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
              >
                {full ? "Complet" : loadingPlanId === p.id ? "..." : "S'abonner"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
