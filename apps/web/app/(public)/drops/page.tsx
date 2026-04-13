"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { isDropActive } from "@bozzart/core";

interface DropRow {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  status: string;
  starts_at: string;
  ends_at: string;
  artist: { full_name: string; slug: string };
}

export default function DropsPage() {
  const [activeDrops, setActiveDrops] = useState<DropRow[]>([]);
  const [upcomingDrops, setUpcomingDrops] = useState<DropRow[]>([]);
  const [pastDrops, setPastDrops] = useState<DropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("drops")
      .select("id, title, description, cover_url, status, starts_at, ends_at, artist:artist_profiles(full_name, slug)")
      .order("starts_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError("Impossible de charger les drops.");
          toast.error("Erreur de chargement");
          setLoading(false);
          return;
        }
        const drops = (data as unknown as DropRow[]) || [];
        const now = new Date();
        setActiveDrops(drops.filter((d) => isDropActive(d.starts_at, d.ends_at)));
        setUpcomingDrops(drops.filter((d) => new Date(d.starts_at) > now && !isDropActive(d.starts_at, d.ends_at)));
        setPastDrops(drops.filter((d) => new Date(d.ends_at) < now));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <p className="text-foreground/60">Chargement...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600" role="alert">{error}</p>
        <button onClick={() => window.location.reload()} className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
          Réessayer
        </button>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h1 className="text-3xl font-bold">Drops</h1>
        <p className="mt-2 text-foreground/60">Événements de vente exclusifs et limités dans le temps</p>

        {/* Drops actifs */}
        {activeDrops.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-green-700">En cours</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {activeDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))}
            </div>
          </section>
        )}

        {/* Drops a venir */}
        {upcomingDrops.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">À venir</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {upcomingDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))}
            </div>
          </section>
        )}

        {/* Drops passes */}
        {pastDrops.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground/40">Terminés</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {pastDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} variant="past" />
              ))}
            </div>
          </section>
        )}

        {activeDrops.length === 0 && upcomingDrops.length === 0 && pastDrops.length === 0 && (
          <p className="mt-12 text-center text-foreground/60">Aucun drop pour le moment.</p>
        )}
      </div>
    </main>
  );
}

function DropCard({ drop, variant }: { drop: DropRow; variant?: "past" }) {
  const isActive = isDropActive(drop.starts_at, drop.ends_at);
  const startsIn = new Date(drop.starts_at).getTime() - Date.now();
  const isUpcoming = startsIn > 0 && !isActive;

  // Countdown live
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!isUpcoming && !isActive) return;
    const target = isActive ? new Date(drop.ends_at).getTime() : new Date(drop.starts_at).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown(""); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setCountdown(`${days}j ${hours}h`);
      else setCountdown(`${hours}h ${mins}min`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [drop.starts_at, drop.ends_at, isUpcoming, isActive]);

  return (
    <div className={`overflow-hidden rounded-xl border ${variant === "past" ? "grayscale" : ""}`}>
      {drop.cover_url && (
        <div className="relative h-48 w-full">
          <Image
            src={drop.cover_url}
            alt={drop.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">{drop.title}</h3>
          {isActive && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">En cours</span>}
          {variant === "past" && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Terminé</span>}
        </div>
        <Link href={`/${drop.artist.slug}`} className="text-sm text-foreground/60 hover:text-foreground/80">
          par {drop.artist.full_name}
        </Link>
        {drop.description && <p className="mt-2 text-sm text-foreground/60">{drop.description}</p>}
        <p className="mt-3 text-sm text-foreground/40">
          {new Date(drop.starts_at).toLocaleDateString("fr-FR")} — {new Date(drop.ends_at).toLocaleDateString("fr-FR")}
        </p>
        {countdown && (
          <p className="mt-1 text-sm font-medium text-brand-600">
            {isActive ? `Se termine dans ${countdown}` : `Commence dans ${countdown}`}
          </p>
        )}
      </div>
    </div>
  );
}
