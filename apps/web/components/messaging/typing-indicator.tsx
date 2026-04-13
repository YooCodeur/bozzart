"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface TypingIndicatorProps {
  conversationId: string;
  onTypingChange?: (isTyping: boolean) => void;
}

/**
 * Gere l'indicateur de frappe via Supabase Realtime Broadcast.
 * Pas de persistence en BDD — uniquement en memoire via le channel.
 */
export function useTypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { user } = useAuth();
  const [othersTyping, setOthersTyping] = useState<string[]>([]);
  const [supabase] = useState(() => createSupabaseBrowserClient());

  useEffect(() => {
    const channel = supabase.channel(`typing:${conversationId}`);

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const senderId = payload.payload?.userId as string;
        if (senderId === user?.id) return;

        setOthersTyping((prev) =>
          prev.includes(senderId) ? prev : [...prev, senderId],
        );

        // Retirer apres 3 secondes sans nouveau signal
        setTimeout(() => {
          setOthersTyping((prev) => prev.filter((id) => id !== senderId));
        }, 3000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, supabase]);

  const sendTyping = useCallback(() => {
    if (!user) return;
    supabase.channel(`typing:${conversationId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id },
    });
  }, [conversationId, user, supabase]);

  return {
    othersTyping: othersTyping.length > 0,
    sendTyping,
  };
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="ml-2 text-xs text-gray-400">est en train d&apos;ecrire...</span>
    </div>
  );
}
