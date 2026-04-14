"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/**
 * Phase 12.2 — Web Push (VAPID) client helpers.
 *
 * Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY to be set at build time.
 * The corresponding VAPID_PRIVATE_KEY lives server-side (Edge Function).
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

/**
 * Returns the current PushSubscription, registering the SW if needed.
 */
async function ensureSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[web-push] NEXT_PUBLIC_VAPID_PUBLIC_KEY missing — cannot subscribe");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  return sub;
}

/**
 * Prompts the browser for notification permission, subscribes to push, and
 * persists the subscription to `push_tokens` with platform='web'.
 * Returns true if a subscription was saved (or already present).
 */
export async function requestWebPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return false;

  const sub = await ensureSubscription();
  if (!sub) return false;

  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  // Token payload: JSON containing endpoint + keys — the Edge Function parses it.
  const token = JSON.stringify({
    endpoint: sub.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
      auth: arrayBufferToBase64(sub.getKey("auth")),
    },
  });

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: auth.user.id,
      token,
      platform: "web",
      is_active: true,
    },
    { onConflict: "user_id,token" },
  );

  if (error) {
    console.error("[web-push] failed to persist subscription", error);
    return false;
  }
  return true;
}

/**
 * Unsubscribes the current browser and marks the token inactive in the DB.
 */
export async function unsubscribeWebPush(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (!sub) return true;

  const token = JSON.stringify({
    endpoint: sub.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
      auth: arrayBufferToBase64(sub.getKey("auth")),
    },
  });

  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user) {
    await supabase
      .from("push_tokens")
      .update({ is_active: false })
      .eq("user_id", auth.user.id)
      .eq("token", token);
  }
  return sub.unsubscribe();
}
