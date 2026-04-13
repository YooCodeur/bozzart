"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function StripeSettingsPage() {
  const { user, artistProfile } = useAuth();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!user || !artistProfile) return;
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-connect-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistProfileId: artistProfile.id,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Erreur lors de la connexion a Stripe");
        setLoading(false);
        return;
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Aucune URL de redirection recue de Stripe");
        setLoading(false);
      }
    } catch {
      toast.error("Erreur reseau lors de la connexion a Stripe");
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Stripe Connect</h1>
      <p className="mt-2 text-gray-600">
        Configurez votre compte Stripe pour recevoir les paiements de vos ventes.
      </p>

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-green-800">
          Stripe configure avec succes ! Vos paiements sont actifs.
        </div>
      )}

      <div className="mt-8 max-w-lg rounded-lg border p-6">
        {artistProfile?.stripeOnboarded ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <p className="font-medium text-green-700">Paiements actifs</p>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Votre compte Stripe est configure. Vous recevrez vos virements sous 48h apres chaque vente.
            </p>
            {artistProfile.stripePayoutsEnabled ? (
              <p className="mt-1 text-sm text-green-600">Virements actives</p>
            ) : (
              <p className="mt-1 text-sm text-yellow-600">Virements en attente de verification Stripe</p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium">Compte non configure</p>
            <p className="mt-2 text-sm text-gray-600">
              Connectez votre compte Stripe pour commencer a vendre. Commission : {artistProfile?.isFounder ? "8%" : "10%"} par vente.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="mt-4 rounded-md bg-brand-600 px-6 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Redirection..." : "Connecter Stripe"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
