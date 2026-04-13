"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="text-2xl font-bold text-foreground">
        Erreur de chargement
      </h2>
      <p className="mt-2 text-foreground/60">
        Impossible de charger cette page du tableau de bord.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition"
      >
        Réessayer
      </button>
    </div>
  );
}
