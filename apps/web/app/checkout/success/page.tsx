"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-black" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Merci pour votre achat !</h1>
        <p className="mt-2 text-foreground/60">
          Votre paiement a été confirmé. L&apos;artiste a été notifié.
        </p>
        <p className="mt-4 text-sm text-foreground/60">
          Un certificat d&apos;authenticité vous sera envoyé par email.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/dashboard/collection"
            className="block rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Voir ma collection
          </Link>
          <Link
            href="/discover"
            className="block rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Continuer à découvrir
          </Link>
        </div>
      </div>
    </main>
  );
}
