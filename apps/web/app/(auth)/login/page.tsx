"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectParam =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Trop de tentatives. Reessayez dans ${secondsLeft} secondes.`);
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        setLockedUntil(Date.now() + 60000);
        setLoginAttempts(0);
        setError("Trop de tentatives. Reessayez dans 60 secondes.");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
      setLoading(false);
      return;
    }

    setLoginAttempts(0);

    if (redirectParam) {
      router.push(redirectParam);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .single();

        if (profile?.role === "artist") {
          router.push("/dashboard");
        } else {
          router.push("/discover");
        }
      } else {
        router.push("/discover");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-16 text-center">
          <Link href="/">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-black">
              Bozzart
            </h1>
          </Link>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-semibold tracking-tight text-black">
          Connexion
        </h2>
        <p className="mt-3 text-center text-sm text-gray-400">
          Accedez a votre espace personnel
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-black placeholder-gray-300 transition-colors focus:border-black focus:outline-none"
              placeholder="vous@exemple.com"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs font-medium text-gray-500">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                Oublie ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-16 text-sm text-black placeholder-gray-300 transition-colors focus:border-black focus:outline-none"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-xs text-gray-400 hover:text-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? "Masquer" : "Voir"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-16 text-center text-sm text-gray-400">
          Pas encore de compte ?{" "}
          <Link
            href="/signup"
            className="text-black font-medium hover:opacity-70 transition-opacity"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
