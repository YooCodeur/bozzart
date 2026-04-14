import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import webpush from "npm:web-push@3.6.7";

/**
 * Phase 12.2 — Unified push sender.
 *
 * Accepts a single notification payload and fans out to every active token
 * registered for the user, routing by `platform`:
 *   - 'web'              -> Web Push (VAPID)
 *   - 'ios' | 'android'  -> Expo Push API
 *   - NULL / unknown     -> assumed Expo (legacy rows, TODO backfill)
 *
 * All sends run in parallel via Promise.allSettled; per-token failures are
 * logged and invalid tokens are marked inactive.
 */

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@bozzart.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface PushRequest {
  user_id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  badge?: string;
}

interface TokenRow {
  id: string;
  token: string;
  platform: "web" | "ios" | "android" | null;
}

async function deactivate(tokenId: string, reason: string) {
  console.warn(`[push] deactivating token ${tokenId}: ${reason}`);
  await supabase.from("push_tokens").update({ is_active: false }).eq("id", tokenId);
}

async function sendWeb(row: TokenRow, payload: PushRequest): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    throw new Error("VAPID keys not configured");
  }
  let subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  try {
    subscription = JSON.parse(row.token);
  } catch {
    await deactivate(row.id, "malformed web subscription");
    return;
  }
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        url: payload.url,
        badge: payload.badge,
      }),
    );
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await deactivate(row.id, `web-push ${status}`);
    } else {
      throw err;
    }
  }
}

async function sendExpoBatch(rows: TokenRow[], payload: PushRequest): Promise<void> {
  if (!rows.length) return;
  const messages = rows.map((r) => ({
    to: r.token,
    title: payload.title,
    body: payload.body,
    sound: "default" as const,
    data: { url: payload.url, badge: payload.badge, icon: payload.icon },
  }));
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    },
    body: JSON.stringify(messages),
  });
  const result = await response.json();
  if (Array.isArray(result?.data)) {
    await Promise.allSettled(
      result.data.map((ticket: { status: string; details?: { error?: string } }, i: number) => {
        if (
          ticket.status === "error" &&
          ticket.details?.error === "DeviceNotRegistered" &&
          rows[i]
        ) {
          return deactivate(rows[i]!.id, "DeviceNotRegistered");
        }
        return Promise.resolve();
      }),
    );
  }
}

serve(async (req) => {
  let payload: PushRequest;
  try {
    payload = (await req.json()) as PushRequest;
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  if (!payload.user_id || !payload.title || !payload.body) {
    return new Response("missing required fields", { status: 400 });
  }

  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("id, token, platform")
    .eq("user_id", payload.user_id)
    .eq("is_active", true);

  if (error) {
    console.error("[push] failed to fetch tokens", error);
    return new Response("db error", { status: 500 });
  }
  if (!tokens?.length) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = tokens as TokenRow[];
  const webTokens = rows.filter((t) => t.platform === "web");
  const expoTokens = rows.filter((t) => t.platform !== "web"); // ios/android/null

  const jobs: Promise<unknown>[] = [];
  for (const row of webTokens) jobs.push(sendWeb(row, payload));
  if (expoTokens.length) jobs.push(sendExpoBatch(expoTokens, payload));

  const results = await Promise.allSettled(jobs);
  const failures = results.filter((r) => r.status === "rejected");
  for (const f of failures) {
    console.error("[push] send failed", (f as PromiseRejectedResult).reason);
  }

  return new Response(
    JSON.stringify({
      sent: rows.length,
      web: webTokens.length,
      expo: expoTokens.length,
      failures: failures.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
