"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface PostCarouselProps {
  images: string[];
  alt?: string;
  aspect?: "square" | "auto";
}

/**
 * Multi-image carousel with CSS scroll-snap, swipe support, and dot indicators.
 * Used in both post creation preview and feed rendering for process / mixed posts.
 */
export function PostCarousel({ images, alt = "", aspect = "square" }: PostCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIndex(idx);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToIndex(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  if (!images.length) return null;

  const aspectClass = aspect === "square" ? "aspect-square" : "";

  return (
    <div className="relative w-full">
      <div
        ref={scrollerRef}
        className={`flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth ${aspectClass}`}
        style={{ scrollbarWidth: "none" }}
        aria-roledescription="carousel"
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full w-full flex-shrink-0 snap-center bg-gray-100"
            style={{ minWidth: "100%" }}
            aria-roledescription="slide"
            aria-label={`Image ${i + 1} sur ${images.length}`}
          >
            {aspect === "square" ? (
              <Image
                src={src}
                alt={alt ? `${alt} (${i + 1}/${images.length})` : ""}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ? `${alt} (${i + 1}/${images.length})` : ""} className="w-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Aller a l'image ${i + 1}`}
              className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
