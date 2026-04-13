"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { ReactionType } from "@bozzart/api";

const reactionLabels: Record<ReactionType, { emoji: string; label: string }> = {
  touched: { emoji: "💫", label: "Touche" },
  want: { emoji: "🔥", label: "J'en veux" },
  how: { emoji: "🤔", label: "Comment ?" },
  share: { emoji: "📤", label: "Partager" },
};

interface ReactionBarProps {
  postId: string;
  counts: Record<string, number>;
}

export function ReactionBar({ postId, counts: initialCounts }: ReactionBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState(initialCounts);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [reacting, setReacting] = useState(false);

  async function handleReaction(type: ReactionType) {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (reacting) return;
    setReacting(true);

    const previousCounts = { ...counts };
    const previousReaction = myReaction;

    const supabase = createSupabaseBrowserClient();

    try {
      if (myReaction === type) {
        // Optimistic: remove reaction
        setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] || 0) - 1) }));
        setMyReaction(null);

        const { error } = await supabase.from("reactions").delete().match({ user_id: user.id, post_id: postId });
        if (error) throw error;
      } else if (myReaction) {
        // Optimistic: change reaction type
        setCounts((c) => ({
          ...c,
          [myReaction]: Math.max(0, (c[myReaction] || 0) - 1),
          [type]: (c[type] || 0) + 1,
        }));
        setMyReaction(type);

        const { error } = await supabase
          .from("reactions")
          .update({ type })
          .match({ user_id: user.id, post_id: postId });
        if (error) throw error;
      } else {
        // Optimistic: new reaction
        setCounts((c) => ({ ...c, [type]: (c[type] || 0) + 1 }));
        setMyReaction(type);

        const { error } = await supabase
          .from("reactions")
          .insert({ user_id: user.id, post_id: postId, type });
        if (error) throw error;
      }
    } catch {
      setCounts(previousCounts);
      setMyReaction(previousReaction);
      toast.error("Impossible de reagir. Veuillez reessayer.");
    } finally {
      setReacting(false);
    }
  }

  return (
    <div className="flex gap-2">
      {(Object.entries(reactionLabels) as [ReactionType, { emoji: string; label: string }][]).map(
        ([type, { emoji, label }]) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={reacting}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition disabled:opacity-50 ${
              myReaction === type
                ? "bg-brand-100 text-brand-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label={label}
            title={label}
          >
            <span>{emoji}</span>
            {(counts[type] || 0) > 0 && <span>{counts[type]}</span>}
          </button>
        ),
      )}
    </div>
  );
}
