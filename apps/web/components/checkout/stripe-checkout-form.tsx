"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface StripeCheckoutFormProps {
  amount: number;
  currency: string;
}

export function StripeCheckoutForm({ amount, currency }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (submitError) {
      setError(submitError.message || "Erreur lors du paiement");
      setProcessing(false);
    }
    // Si succes, Stripe redirige automatiquement vers return_url
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-md bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {processing ? "Traitement..." : `Payer ${amount} ${currency}`}
      </button>

      <p className="text-center text-xs text-gray-400">
        Paiement securise par Stripe
      </p>
    </form>
  );
}
