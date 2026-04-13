"use client";

import { useEffect, useRef } from "react";

interface TrackViewProps {
  type: "profile" | "artwork" | "discovery";
  artistId: string;
}

export function TrackView({ type, artistId }: TrackViewProps) {
  const hasSent = useRef(false);

  useEffect(() => {
    // Deduplicate: avoid double-counting in React strict mode
    if (hasSent.current) return;
    hasSent.current = true;

    // Fire and forget — pas de blocage UX
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, artistId }),
    }).catch(() => {
      // Silently fail
    });
  }, [type, artistId]);

  return null;
}
