"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth/auth-provider";
import { LivePlayer } from "./live-player";
import { LiveChat } from "./live-chat";
import { FloatingReactions } from "./floating-reactions";

type Status = "scheduled" | "live" | "ended" | "canceled";

interface Props {
  streamId: string;
  title: string;
  description: string | null;
  status: Status;
  scheduledAt: string | null;
  playbackUrl: string | null;
  recordingUrl: string | null;
  artist: { id: string; fullName: string; slug: string };
}

function useCountdown(target: string | null) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s, diff };
}

export function LiveViewer(props: Props) {
  const { user } = useAuth();
  const [viewers, setViewers] = useState(0);
  const countdown = useCountdown(props.status === "scheduled" ? props.scheduledAt : null);

  // Realtime presence (viewer count)
  useEffect(() => {
    if (props.status !== "live") return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`live-presence:${props.streamId}`, {
      config: { presence: { key: user?.id ?? `anon-${Math.random().toString(36).slice(2)}` } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setViewers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [props.status, props.streamId, user?.id]);

  const isLive = props.status === "live";
  const isEnded = props.status === "ended";
  const canInteract = isLive;

  const playerSrc = isLive
    ? props.playbackUrl
    : isEnded
      ? props.recordingUrl ?? props.playbackUrl
      : null;

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="relative">
          {playerSrc ? (
            <LivePlayer src={playerSrc} className="aspect-video w-full rounded-lg bg-black" />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black text-white">
              {props.status === "scheduled" && countdown ? (
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wider text-gray-300">Live à venir</p>
                  <p className="mt-3 text-4xl font-bold tabular-nums">
                    {countdown.d > 0 && `${countdown.d}j `}
                    {String(countdown.h).padStart(2, "0")}:
                    {String(countdown.m).padStart(2, "0")}:
                    {String(countdown.s).padStart(2, "0")}
                  </p>
                </div>
              ) : props.status === "canceled" ? (
                <p>Live annulé</p>
              ) : (
                <p>Lecteur indisponible</p>
              )}
            </div>
          )}
          {isLive && <FloatingReactions streamId={props.streamId} canReact={canInteract} />}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              DIRECT
            </span>
          )}
          <h1 className="text-xl font-bold">{props.title}</h1>
          {isLive && (
            <span className="ml-auto text-sm text-gray-600">{viewers} spectateurs</span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-600">
          par{" "}
          <Link href={`/${props.artist.slug}`} className="font-medium hover:underline">
            {props.artist.fullName}
          </Link>
        </p>

        {props.description && (
          <p className="mt-3 whitespace-pre-wrap text-gray-800">{props.description}</p>
        )}
      </section>

      <aside className="h-[60vh] lg:h-auto">
        <LiveChat streamId={props.streamId} canChat={canInteract} />
      </aside>
    </main>
  );
}
