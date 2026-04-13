import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-foreground/60">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          Retour a l&apos;accueil
        </Link>
        <Link
          href="/discover"
          className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition"
        >
          Découvrir des œuvres
        </Link>
      </div>
    </main>
  );
}
