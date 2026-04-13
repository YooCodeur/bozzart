import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors ligne",
  description: "Vous êtes actuellement hors ligne.",
};

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white"
    >
      <h1 className="font-playfair text-4xl">Vous êtes hors ligne</h1>
      <p className="max-w-md text-neutral-300">
        La connexion semble interrompue. Certaines pages déjà visitées restent
        consultables depuis le cache. Réessayez dès que votre réseau est de retour.
      </p>
      <a
        href="/"
        className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Réessayer
      </a>
    </main>
  );
}
