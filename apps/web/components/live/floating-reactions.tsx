"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface FloatingEmoji {
  id: number;
  emoji: string;
  offset: number;
}

const EMOJIS = ["❤️", "🔥", "👏", "🎨", "✨"];

interface Props {
  streamId: string;
  canReact: boolean;
}

export function FloatingReactions({ streamId, canReact }: Props) {
  const { user } = useAuth();
  const [floats, setFloats] = useState<FloatingEmoji[]>([]);
  const counter = useRef(0);

  function spawn(emoji: string) {
    const id = ++counter.current;
    const offset = Math.random() * 80 - 40;
    setFloats((prev) => [...prev, { id, emoji, offset }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 2500);
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`live-reactions:${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_reactions",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const r = payload.new as { emoji: string };
          spawn(r.emoji);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  async function react(emoji: string) {
    if (!user || !canReact) return;
    spawn(emoji); // optimistic
    const supabase = createSupabaseBrowserClient();
    await supabase.from("live_reactions").insert({
      stream_id: streamId,
      user_id: user.id,
      emoji,
    });
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 overflow-hidden">
        {floats.map((f) => (
          <span
            key={f.id}
            className="absolute bottom-0 left-1/2 select-none text-3xl"
            style={{
              transform: `translateX(calc(-50% + ${f.offset}px))`,
              animation: "floatUp 2.5s ease-out forwards",
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
      {canReact && user && (
        <div className="mt-3 flex gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => react(e)}
              className="rounded-full border bg-white px-3 py-1 text-lg hover:bg-gray-50"
              aria-label={`Réagir ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes floatUp {
          0% { transform: translate(calc(-50% + var(--offset, 0)), 0); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--offset, 0)), -180px); opacity: 0; }
        }
      `}</style>
    </>
  );
}
