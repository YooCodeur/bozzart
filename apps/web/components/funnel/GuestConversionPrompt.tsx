"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

const LS_KEY = "bozzart:guest:artworks-viewed";
const LS_DISMISSED = "bozzart:guest:prompt-dismissed";
const SOFT_DELAY_MS = 15_000;
const MODAL_THRESHOLD = 3;

export function GuestConversionPrompt({
  artworkId,
  artworkTitle,
}: {
  artworkId: string;
  artworkTitle?: string;
}) {
  const { user, isLoading } = useAuth();
  const [showSoft, setShowSoft] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoading || user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(LS_DISMISSED) === "1") return;

    // Track view count
    let viewed: string[] = [];
    try {
      viewed = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      viewed = [];
    }
    if (!viewed.includes(artworkId)) {
      viewed.push(artworkId);
      if (viewed.length > 20) viewed = viewed.slice(-20);
      localStorage.setItem(LS_KEY, JSON.stringify(viewed));
    }

    if (viewed.length >= MODAL_THRESHOLD) {
      setShowModal(true);
      return;
    }

    const t = window.setTimeout(() => setShowSoft(true), SOFT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [artworkId, user, isLoading]);

  function dismiss() {
    sessionStorage.setItem(LS_DISMISSED, "1");
    setShowSoft(false);
    setShowModal(false);
  }

  if (isLoading || user) return null;

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold">Vous semblez aimer l&apos;art.</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez Bozzart pour sauvegarder vos oeuvres favorites, suivre les
            artistes et constituer votre galerie de collectionneur.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/signup"
              className="flex-1 rounded-md bg-black px-4 py-2 text-center text-sm text-white hover:bg-gray-800"
              onClick={dismiss}
            >
              Creer un compte gratuit
            </Link>
            <button
              onClick={dismiss}
              className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSoft) {
    return (
      <div className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">Creez un compte pour sauvegarder cette oeuvre</p>
            {artworkTitle && (
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">« {artworkTitle} »</p>
            )}
          </div>
          <Link
            href="/signup"
            className="rounded-md bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800"
            onClick={dismiss}
          >
            S&apos;inscrire
          </Link>
          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}
