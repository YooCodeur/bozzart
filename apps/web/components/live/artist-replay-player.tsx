"use client";

import { LivePlayer } from "./live-player";

interface Props {
  src: string;
}

export function ArtistReplayPlayer({ src }: Props) {
  const isHls = src.endsWith(".m3u8");
  if (!isHls) {
    return (
      <video
        src={src}
        controls
        playsInline
        className="aspect-video w-full rounded bg-black"
      />
    );
  }
  return <LivePlayer src={src} autoPlay={false} className="aspect-video w-full rounded bg-black" />;
}
