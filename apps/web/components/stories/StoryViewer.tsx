"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StorySlide } from "./types";
import { SLIDE_DURATION_MS } from "./types";

interface StoryViewerProps {
  slides: StorySlide[];
  /** Index initial. */
  startIndex?: number;
  onClose: () => void;
  /** Optionnel : slide suivante apres la derniere (ex: story suivante). */
  onFinished?: () => void;
  /** Petit header (nom artiste, titre oeuvre). */
  headerTitle?: string;
  headerSubtitle?: string;
}

/**
 * Lecteur plein ecran style Instagram Stories.
 * - tap gauche / droit / clavier
 * - swipe down pour fermer
 * - auto-advance 5s (texte/image/palette/before-after), pause sur video (attend la fin)
 */
export function StoryViewer({
  slides,
  startIndex = 0,
  onClose,
  onFinished,
  headerTitle,
  headerSubtitle,
}: StoryViewerProps) {
  const [index, setIndex] = useState(() => {
    if (slides.length === 0) return 0;
    return Math.min(Math.max(0, startIndex), slides.length - 1);
  });
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 sur le slide courant
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);

  const current = slides[index];
  const isVideo = current?.type === "video" && !!current?.content;

  const goNext = useCallback(() => {
    setProgress(0);
    accumulatedRef.current = 0;
    startTsRef.current = null;
    setIndex((i) => {
      if (i >= slides.length - 1) {
        onFinished?.();
        onClose();
        return i;
      }
      return i + 1;
    });
  }, [slides.length, onClose, onFinished]);

  const goPrev = useCallback(() => {
    setProgress(0);
    accumulatedRef.current = 0;
    startTsRef.current = null;
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-advance RAF loop pour les slides non-video
  useEffect(() => {
    if (!current) return;
    if (isVideo) return; // video gere sa propre progression via onTimeUpdate
    if (paused) return;

    const tick = (ts: number) => {
      if (startTsRef.current == null) startTsRef.current = ts;
      const elapsed = accumulatedRef.current + (ts - startTsRef.current);
      const ratio = Math.min(1, elapsed / SLIDE_DURATION_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      // Sauvegarde le temps ecoule si on pause
      if (startTsRef.current != null) {
        accumulatedRef.current += performance.now() - startTsRef.current;
        startTsRef.current = null;
      }
    };
  }, [index, isVideo, paused, current, goNext]);

  // Clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose();
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    if (endY - touchStartY.current > 80) {
      onClose();
    }
    touchStartY.current = null;
  };

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Histoire de l'oeuvre"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress bar */}
      <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
        {slides.map((_, i) => {
          let pct = 0;
          if (i < index) pct = 100;
          else if (i === index) pct = progress * 100;
          return (
            <div
              key={i}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white transition-[width] duration-75"
                style={{ width: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Header */}
      {(headerTitle || headerSubtitle) && (
        <div className="absolute left-0 right-0 top-4 z-20 flex items-center justify-between px-4 pt-2">
          <div className="text-sm">
            {headerTitle && <div className="font-semibold">{headerTitle}</div>}
            {headerSubtitle && (
              <div className="text-xs opacity-80">{headerSubtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
          >
            ×
          </button>
        </div>
      )}

      {/* Tap zones */}
      <button
        type="button"
        aria-label="Slide precedent"
        onClick={goPrev}
        className="absolute bottom-0 left-0 top-0 z-10 w-1/3 cursor-default opacity-0"
      />
      <button
        type="button"
        aria-label="Slide suivant"
        onClick={goNext}
        className="absolute bottom-0 right-0 top-0 z-10 w-1/3 cursor-default opacity-0"
      />
      <button
        type="button"
        aria-label={paused ? "Reprendre" : "Pause"}
        onClick={() => setPaused((p) => !p)}
        className="absolute bottom-0 left-1/3 right-1/3 top-0 z-10 cursor-default opacity-0"
      />

      {/* Slide content */}
      <div className="relative mx-auto flex h-full max-w-md items-center justify-center">
        <SlideContent
          slide={current}
          videoRef={videoRef}
          onVideoEnded={goNext}
          onVideoProgress={(r) => setProgress(r)}
          paused={paused}
        />
      </div>
    </div>
  );
}

function SlideContent({
  slide,
  videoRef,
  onVideoEnded,
  onVideoProgress,
  paused,
}: {
  slide: StorySlide;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  onVideoEnded: () => void;
  onVideoProgress: (ratio: number) => void;
  paused: boolean;
}) {
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, videoRef, slide.id]);

  if (slide.type === "image") {
    return (
      <div className="relative h-full w-full">
        {slide.content && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.content}
            alt={slide.caption ?? ""}
            className="h-full w-full object-contain"
          />
        )}
        {slide.caption && (
          <div className="absolute bottom-16 left-0 right-0 px-6 text-center text-lg font-medium drop-shadow-lg">
            {slide.caption}
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "text") {
    return (
      <div
        className="flex h-full w-full items-center justify-center p-8 text-center"
        style={{
          backgroundColor: slide.bg_color ?? "#111827",
          color: slide.text_color ?? "#ffffff",
        }}
      >
        <p className="whitespace-pre-wrap text-2xl font-medium leading-snug">
          {slide.caption ?? ""}
        </p>
      </div>
    );
  }

  if (slide.type === "video" && slide.content) {
    return (
      <video
        ref={videoRef}
        src={slide.content}
        className="h-full w-full object-contain"
        autoPlay
        playsInline
        onEnded={onVideoEnded}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration > 0) onVideoProgress(v.currentTime / v.duration);
        }}
      />
    );
  }

  if (slide.type === "before_after") {
    return <BeforeAfter slide={slide} />;
  }

  if (slide.type === "palette") {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-4 p-8"
        style={{ backgroundColor: slide.bg_color ?? "#0f172a" }}
      >
        {slide.caption && (
          <p className="text-center text-lg font-medium">{slide.caption}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {(slide.colors ?? []).map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="h-16 w-16 rounded-full border border-white/20"
                style={{ backgroundColor: c }}
              />
              <span className="text-xs opacity-80">{c}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function BeforeAfter({ slide }: { slide: StorySlide }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-full w-full overflow-hidden">
      {slide.before_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.before_url}
          alt="Avant"
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      {slide.after_url && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.after_url}
            alt="Apres"
            className="h-full w-full object-contain"
          />
        </div>
      )}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute bottom-16 left-1/2 z-10 w-3/4 -translate-x-1/2"
        aria-label="Comparer avant / apres"
        onClick={(e) => e.stopPropagation()}
      />
      {slide.caption && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm opacity-90">
          {slide.caption}
        </div>
      )}
    </div>
  );
}
