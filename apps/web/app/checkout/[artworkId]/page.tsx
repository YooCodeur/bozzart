"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { StripeCheckoutForm } from "@/components/checkout/stripe-checkout-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatPrice } from "@bozzart/core";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface ArtworkForCheckout {
  id: string;
  title: string;
  primary_image_url: string;
  price: number;
  price_currency: string;
  artist: { full_name: string; slug: string; commission_rate: number };
}

interface Props {
  params: { artworkId: string };
}

export default function CheckoutPage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<ArtworkForCheckout | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("artworks")
      .select("id, title, primary_image_url, price, price_currency, artist:artist_profiles(full_name, slug, commission_rate)")
      .eq("id", params.artworkId)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        setArtwork(data as unknown as ArtworkForCheckout | null);
        setLoading(false);
      });
  }, [params.artworkId]);

  async function handleCreatePayment() {
    if (!artwork) return;
    if (!user && (!guestEmail || !guestName)) {
      setError("Email et nom requis pour un achat sans compte");
      return;
    }

    setCreating(true);
    setError("");

    const response = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artworkId: artwork.id,
        buyerId: user?.id || null,
        guestEmail: user ? null : guestEmail,
        guestName: user ? null : guestName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Erreur lors de la création du paiement");
      setCreating(false);
      return;
    }

    setClientSecret(data.clientSecret);
    setCreating(false);
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Chargement...</p></div>;
  }

  if (!artwork) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Œuvre non trouvée</p></div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
        <Breadcrumbs items={[
          { label: "Accueil", href: "/" },
          { label: "Paiement" },
        ]} />
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Retour
        </button>
        <h1 className="mt-2 text-xl font-bold">Finaliser l&apos;achat</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Paiement sécurisé par Stripe
        </p>

        {/* Recap oeuvre */}
        <div className="mt-6 flex gap-4 rounded-lg bg-gray-50 p-4">
          <Image src={artwork.primary_image_url} alt={artwork.title} width={80} height={80} className="h-20 w-20 rounded-lg object-cover" />
          <div>
            <h2 className="font-medium">{artwork.title}</h2>
            <p className="text-sm text-gray-500">par {artwork.artist.full_name}</p>
            <p className="mt-1 text-lg font-bold">{formatPrice(artwork.price, artwork.price_currency)}</p>
          </div>
        </div>

        {/* Etape 1 : infos guest + creer le payment intent */}
        {!clientSecret && (
          <>
            {!user && (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-gray-600">Achetez sans créer de compte :</p>
                <div>
                  <label htmlFor="checkout-guestName" className="block text-sm font-medium text-gray-700">Nom</label>
                  <input id="checkout-guestName" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Jean Dupont" />
                </div>
                <div>
                  <label htmlFor="checkout-guestEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <input id="checkout-guestEmail" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="jean@exemple.com" />
                </div>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}

            <button
              onClick={handleCreatePayment}
              disabled={creating}
              className="mt-6 w-full rounded-md bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? "Préparation..." : "Continuer vers le paiement"}
            </button>
          </>
        )}

        {/* Etape 2 : Stripe Elements */}
        {clientSecret && (
          <div className="mt-6">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: "stripe", variables: { colorPrimary: "#000" } },
              }}
            >
              <StripeCheckoutForm amount={artwork.price} currency={artwork.price_currency} />
            </Elements>
          </div>
        )}
      </div>
    </main>
  );
}
