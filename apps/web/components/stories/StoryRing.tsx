"use client";

import type { ReactNode } from "react";

interface StoryRingProps {
  /** Affiche l'anneau colore (l'oeuvre a une story publiee). */
  hasStory: boolean;
  /** Taille en px (diametre). */
  size?: number;
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

/**
 * Cercle colore reutilisable pour indiquer qu'un contenu (oeuvre, post)
 * possede une story visuelle publiee. Meme visuel que le feed Instagram.
 */
export function StoryRing({
  hasStory,
  size = 72,
  children,
  onClick,
  ariaLabel,
}: StoryRingProps) {
  if (!hasStory) {
    return (
      <div style={{ width: size, height: size }} className="relative">
        {children}
      </div>
    );
  }

  const content = (
    <div
      style={{ width: size, height: size }}
      className="relative rounded-full p-[3px]"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6, #f59e0b)",
        }}
        aria-hidden
      />
      <div className="relative h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
        <div className="h-full w-full overflow-hidden rounded-full">
          {children}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? "Voir l'histoire"}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-full"
      >
        {content}
      </button>
    );
  }

  return content;
}
