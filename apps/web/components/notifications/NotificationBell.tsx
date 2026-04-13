"use client";

// TODO: Mount this component in the app header when the header is unlocked.
// Intentionally NOT wired into apps/web/components/layout/header.tsx (off-limits).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  url: string | null;
  read: boolean | null;
  is_read: boolean | null;
  category: string | null;
  created_at: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,url,read,is_read,category,created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setItems((data as NotificationRow[]) || []);
    }
    load();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => { load(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unread = items.filter((n) => !(n.read ?? n.is_read)).length;

  async function markAllRead() {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("notifications")
      .update({ read: true, is_read: true })
      .eq("user_id", user.id)
      .or("read.is.false,is_read.is.false");
    setItems((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded p-2 hover:bg-neutral-100"
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-200 p-3">
            <div className="text-sm font-semibold">Notifications</div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:underline"
              disabled={unread === 0}
            >
              Marquer tout comme lu
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <li className="p-4 text-center text-sm text-neutral-500">Aucune notification</li>
            )}
            {items.map((n) => {
              const isRead = n.read ?? n.is_read;
              const content = (
                <div className={`p-3 ${isRead ? "" : "bg-blue-50"}`}>
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-xs text-neutral-600">{n.body}</div>}
                  <div className="mt-1 text-[10px] text-neutral-400">
                    {new Date(n.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>
              );
              return (
                <li key={n.id} className="border-b border-neutral-100 last:border-b-0">
                  {n.url ? <Link href={n.url}>{content}</Link> : content}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
