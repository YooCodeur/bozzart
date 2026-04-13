"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-4xl font-bold text-foreground">
        Une erreur est survenue
      </h1>
      <p className="mt-4 text-foreground/60">
        Nous sommes désolés, quelque chose s&apos;est mal passé.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition"
      >
        Réessayer
      </button>
    </main>
  );
}
