"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-black" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // TODO: consider role-based redirect here (artists -> /dashboard). For now, default to /feed.
        const redirect = searchParams.get("redirect") || "/feed";
        router.push(redirect);
      }
    });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50/60 px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-black">
            Bozzart
          </h1>
        </Link>

        <div className="mt-10 rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {/* Animated spinner */}
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-black" />

          <p className="text-sm font-medium text-gray-700">
            Connexion en cours...
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Vous allez etre redirige automatiquement
          </p>
        </div>
      </div>
    </main>
  );
}
