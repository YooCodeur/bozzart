"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  deep_link: string | null;
  created_at: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();

    // Charger les notifications
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger les notifications.");
          return;
        }
        const notifs = (data as NotificationRow[]) || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      });

    // Realtime
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as NotificationRow;
          setNotifications((prev) => [notif, ...prev]);
          setUnreadCount((c) => c + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function markAllRead() {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error("Impossible de marquer les notifications comme lues.");
    }
  }

  async function markRead(id: string) {
    const supabase = createSupabaseBrowserClient();

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    if (error) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error("Impossible de marquer la notification comme lue.");
    }
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} role="presentation" />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">Aucune notification</p>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      markRead(notif.id);
                      if (notif.deep_link) router.push(notif.deep_link);
                    }}
                    className={`block w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
                      !notif.is_read ? "bg-brand-50" : ""
                    }`}
                  >
                    <p className="text-sm font-medium">{notif.title}</p>
                    {notif.body && <p className="mt-0.5 text-xs text-gray-500">{notif.body}</p>}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
