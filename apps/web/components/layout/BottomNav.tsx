"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
  match: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/discover",
    label: "Decouvrir",
    match: (p) => p.startsWith("/discover"),
    icon: (active) => (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
      </svg>
    ),
  },
  {
    href: "/feed",
    label: "Feed",
    match: (p) => p.startsWith("/feed"),
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    match: (p) => p.startsWith("/dashboard/messages"),
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.4-4 8-9 8-1.3 0-2.6-.2-3.7-.7L3 21l1.7-4.3C3.6 15.4 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Profil",
    match: (p) => p === "/dashboard" || (p.startsWith("/dashboard") && !p.startsWith("/dashboard/messages")),
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    const load = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (!cancelled && !error) setUnread(count ?? 0);
    };

    load();

    const channel = supabase
      .channel(`bottomnav-notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) return null;

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const showBadge = item.href === "/dashboard" && unread > 0;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition-colors ${
                  active ? "text-brand-600" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span className="relative">
                  {item.icon(active)}
                  {showBadge && (
                    <span
                      aria-label={`${unread} notifications non lues`}
                      className="absolute -right-2 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-[18px] text-white text-center"
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
