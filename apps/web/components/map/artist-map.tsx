"use client";

import { useEffect, useRef, useState } from "react";

interface ArtistMapProps {
  artists: {
    slug: string;
    full_name: string;
    location_lat: number;
    location_lng: number;
    location_city: string;
    artwork_count: number;
  }[];
}

/**
 * Carte des artistes utilisant Leaflet directement (import dynamique).
 */
export function ArtistMap({ artists }: ArtistMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current || artists.length === 0) return;

    let mapInstance: { remove: () => void } | null = null;

    async function initMap() {
      const L = await import("leaflet");

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const center: [number, number] = artists.length > 0
        ? [artists[0]!.location_lat, artists[0]!.location_lng]
        : [46.6, 2.3];

      const m = L.map(mapRef.current!).setView(center, 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);

      artists.forEach((artist) => {
        L.marker([artist.location_lat, artist.location_lng], { icon })
          .addTo(m)
          .bindPopup(
            `<a href="/${artist.slug}" style="font-weight:600;color:#7e22ce">${artist.full_name}</a><br/><span style="font-size:12px;color:#666">${artist.location_city} · ${artist.artwork_count} oeuvre${artist.artwork_count !== 1 ? "s" : ""}</span>`,
          );
      });

      mapInstance = m;
    }

    initMap();

    return () => {
      mapInstance?.remove();
    };
  }, [mounted, artists]);

  if (!mounted) {
    return <div className="h-[500px] rounded-lg bg-gray-100 animate-pulse" />;
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div ref={mapRef} className="h-[500px] rounded-lg overflow-hidden border" />
    </>
  );
}
