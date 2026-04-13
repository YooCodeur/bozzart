"use client";

import Image from "next/image";

interface ArtworkImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

/**
 * Wrapper autour de next/image pour les images d'oeuvres.
 * Gere les URLs externes (Supabase Storage, R2, placeholder).
 */
export function ArtworkImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: ArtworkImageProps) {
  // Fallback si pas d'URL valide
  if (!src || src === "") {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className || ""}`}>
        <span className="text-gray-400 text-sm">Pas d&apos;image</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("https://placeholder")}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("https://placeholder")}
    />
  );
}
