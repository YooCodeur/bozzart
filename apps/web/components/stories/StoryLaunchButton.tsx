"use client";

import { useState } from "react";
import { StoryViewer } from "./StoryViewer";
import type { StorySlide } from "./types";

interface Props {
  slides: StorySlide[];
  headerTitle?: string;
  headerSubtitle?: string;
  label?: string;
}

/**
 * Bouton "Voir l'histoire" qui ouvre le StoryViewer plein ecran.
 * Rien n'est rendu si la story est vide (pas de slides).
 */
export function StoryLaunchButton({
  slides,
  headerTitle,
  headerSubtitle,
  label = "Voir l'histoire",
}: Props) {
  const [open, setOpen] = useState(false);
  if (!slides || slides.length === 0) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-purple-300 bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 px-4 py-2 text-sm font-medium text-purple-900 hover:from-amber-100 hover:to-purple-100"
      >
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500"
        />
        {label}
      </button>
      {open && (
        <StoryViewer
          slides={slides}
          onClose={() => setOpen(false)}
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
        />
      )}
    </>
  );
}
