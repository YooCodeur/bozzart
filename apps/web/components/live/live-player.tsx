"use client";

import { useEffect, useRef } from "react";

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

/**
 * Adaptive HLS player. Uses native HLS on Safari, hls.js elsewhere.
 */
export function LivePlayer({ src, poster, autoPlay = true, controls = true, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Native HLS (Safari, iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let hlsInstance: { destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const mod = await import("hls.js");
        const Hls = mod.default;
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hlsInstance = hls;
        } else {
          video.src = src;
        }
      } catch (err) {
        console.warn("hls.js unavailable, falling back", err);
        video.src = src;
      }
    })();

    return () => {
      cancelled = true;
      hlsInstance?.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      playsInline
      muted={autoPlay}
      className={className ?? "aspect-video w-full bg-black"}
    />
  );
}
