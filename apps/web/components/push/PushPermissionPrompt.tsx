"use client";

import { useEffect, useState } from "react";
import { requestWebPushPermission } from "@/lib/push/web-push";

const VISIT_COUNTER_KEY = "bozzart:visit_count";
const DISMISSED_KEY = "bozzart:push_prompt_dismissed";
const MIN_VISITS = 3;

/**
 * Phase 12.2 — banner shown after the user's 3rd visit asking to enable web
 * push notifications. Dismissible; state persisted to localStorage.
 */
export function PushPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY) === "1") return;

    // Increment visit counter (once per page load).
    const prev = Number(localStorage.getItem(VISIT_COUNTER_KEY) ?? "0");
    const next = prev + 1;
    localStorage.setItem(VISIT_COUNTER_KEY, String(next));

    if (next >= MIN_VISITS) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  const accept = async () => {
    setBusy(true);
    try {
      const ok = await requestWebPushPermission();
      localStorage.setItem(DISMISSED_KEY, "1");
      setVisible(false);
      if (!ok) console.info("[push-prompt] permission not granted");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Activer les notifications"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl rounded-t-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-2xl sm:bottom-4 sm:rounded-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            Recevez les nouveautes en direct
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Activez les notifications pour suivre les nouvelles oeuvres et messages
            des artistes.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={accept}
            disabled={busy}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {busy ? "..." : "Activer"}
          </button>
        </div>
      </div>
    </div>
  );
}
