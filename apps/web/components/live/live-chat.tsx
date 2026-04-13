"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface Props {
  streamId: string;
  canChat: boolean;
}

export function LiveChat({ streamId, canChat }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase
      .from("live_chat_messages")
      .select("*")
      .eq("stream_id", streamId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as ChatMessage[]) ?? []);
      });

    const channel = supabase
      .channel(`live-chat:${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim() || sending) return;
    setSending(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("live_chat_messages").insert({
      stream_id: streamId,
      user_id: user.id,
      body: body.trim().slice(0, 500),
    });
    setSending(false);
    if (error) {
      toast.error("Message non envoyé");
    } else {
      setBody("");
    }
  }

  return (
    <div className="flex h-full flex-col rounded border bg-white">
      <div className="border-b px-3 py-2 text-sm font-medium">Chat</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 text-sm">
        {messages.length === 0 ? (
          <p className="text-gray-400">Soyez le premier à écrire.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="mb-1">
              <span className="font-medium text-gray-700">{m.user_id.slice(0, 6)}</span>{" "}
              <span>{m.body}</span>
            </div>
          ))
        )}
      </div>
      {canChat && user ? (
        <form onSubmit={send} className="flex gap-2 border-t p-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            placeholder="Votre message…"
            className="flex-1 rounded border px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            Envoyer
          </button>
        </form>
      ) : (
        <p className="border-t px-3 py-2 text-xs text-gray-500">
          {user ? "Chat indisponible." : "Connectez-vous pour participer."}
        </p>
      )}
    </div>
  );
}
