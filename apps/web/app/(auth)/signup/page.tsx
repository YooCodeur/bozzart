"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Role = "buyer" | "artist";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acceptCgv, setAcceptCgv] = useState(false);
  const router = useRouter();

  const passwordValid = password.length >= 8;
  const usernameClean = username.toLowerCase().replace(/[^a-z0-9-]/g, "");

  function canAdvance() {
    if (step === 1) return role !== null;
    if (step === 2)
      return displayName.trim().length > 0 && usernameClean.length >= 3;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setError("Veuillez choisir votre profil.");
      return;
    }
    if (!passwordValid) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", usernameClean)
      .single();

    if (existing) {
      setError(
        "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre."
      );
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: usernameClean,
          display_name: displayName,
          role,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Un compte existe déjà avec cette adresse email.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    // Claim referral (if a ref_code cookie was set via /r/[code])
    try {
      await fetch("/api/referrals/claim", { method: "POST" });
    } catch {
      // best-effort; do not block signup success
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-black">
              Bozzart
            </h1>
          </Link>

          <div className="mt-16">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-black">
              Compte créé
            </h2>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Un email de confirmation a été envoyé à{" "}
              <span className="text-black font-medium">{email}</span>.
              <br />
              Vérifiez votre boîte de réception.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-block rounded-xl bg-black px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
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
          Créer un compte
        </h2>
        <p className="mt-3 text-center text-sm text-gray-400">
          Étape {step} sur 3
        </p>

        {/* Step dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-6 bg-black"
                  : s < step
                    ? "w-1.5 bg-black"
                    : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === "Enter" && step < 3) e.preventDefault(); }} className="mt-10">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setRole("artist")}
                className={`w-full rounded-xl border px-5 py-5 text-left transition-colors ${
                  role === "artist"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-black hover:border-gray-300"
                }`}
              >
                <span className="block text-sm font-semibold">Artiste</span>
                <span
                  className={`mt-1 block text-xs ${
                    role === "artist" ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  Exposez et vendez vos œuvres
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`w-full rounded-xl border px-5 py-5 text-left transition-colors ${
                  role === "buyer"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-black hover:border-gray-300"
                }`}
              >
                <span className="block text-sm font-semibold">
                  Collectionneur
                </span>
                <span
                  className={`mt-1 block text-xs ${
                    role === "buyer" ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  Découvrez et achetez des œuvres
                </span>
              </button>
            </div>
          )}

          {/* Step 2: Identity */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-xs font-medium text-gray-500 mb-2"
                >
                  Nom affiché
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-black placeholder-gray-300 transition-colors focus:border-black focus:outline-none"
                  placeholder="Marie Dupont"
                />
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-gray-500 mb-2"
                >
                  Nom d&apos;utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  required
                  minLength={3}
                  maxLength={40}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-black placeholder-gray-300 transition-colors focus:border-black focus:outline-none"
                  placeholder="marie-dupont"
                />
                {usernameClean && (
                  <p className="mt-2 text-xs text-gray-400">
                    bozzart.art/
                    <span className="text-black">{usernameClean}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Credentials */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-500 mb-2"
                >
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
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-500 mb-2"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-16 text-sm text-black placeholder-gray-300 transition-colors focus:border-black focus:outline-none"
                    placeholder="8 caractères minimum"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-xs text-gray-400 hover:text-black transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? "Masquer" : "Voir"}
                  </button>
                </div>
                {password && (
                  <p
                    className={`mt-2 text-xs ${passwordValid ? "text-gray-400" : "text-red-400"}`}
                  >
                    {passwordValid
                      ? "Mot de passe valide"
                      : `Encore ${8 - password.length} caractère${8 - password.length > 1 ? "s" : ""}`}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="accept-cgv"
                  checked={acceptCgv}
                  onChange={(e) => setAcceptCgv(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="accept-cgv" className="text-xs text-gray-500">
                  J&apos;accepte les{" "}
                  <Link
                    href="/cgv"
                    className="text-brand-600 hover:underline"
                    target="_blank"
                  >
                    Conditions Générales de Vente
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/confidentialite"
                    className="text-brand-600 hover:underline"
                    target="_blank"
                  >
                    Politique de Confidentialité
                  </Link>
                </label>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-5 text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(step - 1);
                }}
                className="rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-medium text-black transition-colors hover:border-gray-300"
              >
                Retour
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(step + 1);
                }}
                disabled={!canAdvance()}
                className="flex-1 rounded-xl bg-black py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30"
              >
                Continuer
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !passwordValid || !email || !acceptCgv}
                className="flex-1 rounded-xl bg-black py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30"
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <p className="mt-16 text-center text-sm text-gray-400">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-black font-medium hover:opacity-70 transition-opacity"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
