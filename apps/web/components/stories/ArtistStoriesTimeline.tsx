"use client";

import { useState } from "react";
import Image from "next/image";
import { StoryViewer } from "./StoryViewer";
import { StoryRing } from "./StoryRing";
import type { StorySlide } from "./types";

export interface ArtworkStoryEntry {
  artwork_id: string;
  artwork_title: string;
  primary_image_url: string | null;
  slides: StorySlide[];
  created_at: string;
}

interface Props {
  artistName: string;
  stories: ArtworkStoryEntry[];
}

/**
 * Timeline des oeuvres qui ont une story publiee. Click sur un point = StoryViewer.
 */
export function ArtistStoriesTimeline({ artistName, stories }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (stories.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucune histoire visuelle publiée pour le moment.
      </p>
    );
  }

  const active = openIndex != null ? stories[openIndex] : null;

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Histoires d&apos;œuvres</h3>
      <div className="relative">
        <div className="absolute left-8 right-8 top-10 h-px bg-gray-200" aria-hidden />
        <ol className="flex flex-wrap gap-6">
          {stories.map((s, i) => (
            <li key={s.artwork_id} className="flex flex-col items-center">
              <StoryRing
                hasStory
                size={80}
                onClick={() => setOpenIndex(i)}
                ariaLabel={`Voir l'histoire de ${s.artwork_title}`}
              >
                {s.primary_image_url ? (
                  <Image
                    src={s.primary_image_url}
                    alt={s.artwork_title}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </StoryRing>
              <span className="mt-2 max-w-[96px] truncate text-center text-xs text-gray-600">
                {s.artwork_title}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {active && (
        <StoryViewer
          slides={active.slides}
          onClose={() => setOpenIndex(null)}
          onFinished={() => {
            // Enchaine sur la story suivante si dispo
            setOpenIndex((idx) =>
              idx != null && idx < stories.length - 1 ? idx + 1 : null,
            );
          }}
          headerTitle={artistName}
          headerSubtitle={active.artwork_title}
        />
      )}
    </div>
  );
}
