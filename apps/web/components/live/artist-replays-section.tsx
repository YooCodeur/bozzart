import Link from "next/link";
import { ArtistReplayPlayer } from "./artist-replay-player";

interface Replay {
  id: string;
  title: string;
  description: string | null;
  ended_at: string | null;
  recording_url: string | null;
  provider_playback_id: string | null;
}

interface Props {
  replays: Replay[];
}

/**
 * Additive "Replay" section displayed below the existing artist profile tabs.
 * Does not modify or remove any existing tabs.
 */
export function ArtistReplaysSection({ replays }: Props) {
  if (!replays || replays.length === 0) return null;
  return (
    <section className="mx-auto max-w-4xl px-8 py-10 border-t">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Replays</h2>
        <Link href="/live" className="text-sm text-gray-600 hover:underline">
          Voir tous les lives →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {replays.map((r) => {
          const src =
            r.recording_url ??
            (r.provider_playback_id
              ? `https://stream.mux.com/${r.provider_playback_id}.m3u8`
              : null);
          return (
            <article key={r.id} className="rounded-lg border bg-white p-3">
              {src ? (
                <ArtistReplayPlayer src={src} />
              ) : (
                <div className="aspect-video w-full rounded bg-gray-100" />
              )}
              <h3 className="mt-3 font-medium">
                <Link href={`/live/${r.id}`} className="hover:underline">
                  {r.title}
                </Link>
              </h3>
              {r.ended_at && (
                <p className="text-xs text-gray-500">
                  {new Date(r.ended_at).toLocaleDateString("fr-FR")}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
