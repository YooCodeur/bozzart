"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  artistSlug?: string | null;
  isLocked: boolean;
  children: ReactNode;
}

/**
 * Wrapper autour d'un post du carnet. Si l'acces est restreint et que
 * le viewer n'est pas abonne, applique un overlay "Abonnez-vous pour voir".
 * N'altere pas FeedPostCard / FeedList : se contente de les envelopper.
 */
export function ExclusivePostGate({ artistSlug, isLocked, children }: Props) {
  if (!isLocked) return <>{children}</>;

  const href = artistSlug ? `/${artistSlug}#soutenir` : "#";

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div aria-hidden="true" className="pointer-events-none blur-md select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-6 text-center">
        <span className="text-3xl" role="img" aria-label="Cadenas">🔒</span>
        <p className="mt-2 font-semibold">Reserve aux abonnes</p>
        <p className="text-sm mt-1 opacity-90 max-w-xs">
          Abonnez-vous pour voir ce contenu exclusif.
        </p>
        <Link
          href={href}
          className="mt-3 inline-block bg-white text-black px-4 py-2 rounded font-medium text-sm"
        >
          Abonnez-vous pour voir
        </Link>
      </div>
    </div>
  );
}

/**
 * Helper : determine si un post doit etre verrouille pour le viewer.
 */
export function shouldLockPost(
  accessLevel: string | null | undefined,
  opts: { isAuthor: boolean; isSubscriber: boolean; isFollower: boolean },
): boolean {
  if (!accessLevel || accessLevel === "public") return false;
  if (opts.isAuthor) return false;
  if (accessLevel === "subscribers") return !opts.isSubscriber;
  if (accessLevel === "followers") return !opts.isFollower;
  return false;
}
