// Shared notification helper for Edge Functions.
// Creates an in-app notification row and dispatches a push via send-push-notification
// when the user preference allows it.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

export type NotificationCategory =
  | "new_post_from_followed_artist"
  | "artist_live_starting"
  | "subscription_expiring"
  | "price_drop_wishlist"
  | "commission_update"
  | "referral_converted"
  | "social_proof"
  | "reengagement";

const CATEGORY_PREFIX: Record<NotificationCategory, string> = {
  new_post_from_followed_artist: "new_post",
  artist_live_starting: "live",
  subscription_expiring: "sub",
  price_drop_wishlist: "price_drop",
  commission_update: "commission",
  referral_converted: "referral",
  social_proof: "social",
  reengagement: "reengage",
};

export interface NotifyInput {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  url?: string;
}

export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function notify(input: NotifyInput): Promise<void> {
  const supabase = getServiceClient();
  const prefix = CATEGORY_PREFIX[input.category];

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", input.userId)
    .maybeSingle();

  const inAppKey = `${prefix}_in_app`;
  const pushKey = `${prefix}_push`;

  const inAppAllowed = prefs ? (prefs as Record<string, boolean>)[inAppKey] ?? true : true;
  const pushAllowed = prefs ? (prefs as Record<string, boolean>)[pushKey] ?? true : true;

  if (inAppAllowed) {
    await supabase.from("notifications").insert({
      user_id: input.userId,
      type: "system",
      category: input.category,
      title: input.title,
      body: input.body,
      url: input.url ?? null,
      deep_link: input.url ?? null,
      read: false,
      is_read: false,
    });
  }

  if (pushAllowed) {
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          userId: input.userId,
          title: input.title,
          body: input.body,
          deepLink: input.url,
          data: { category: input.category },
        }),
      });
    } catch (err) {
      console.error("push dispatch failed", err);
    }
  }
}
