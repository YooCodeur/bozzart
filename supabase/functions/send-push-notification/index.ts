import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface PushRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  deepLink?: string;
}

serve(async (req) => {
  const { userId, title, body, data, deepLink }: PushRequest = await req.json();

  // Recuperer les tokens push actifs de l'utilisateur
  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!tokens?.length) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Construire les messages Expo Push
  const messages = tokens.map(({ token }) => ({
    to: token,
    title,
    body,
    data: { ...data, deepLink },
    sound: "default" as const,
  }));

  // Envoyer via Expo Push API
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

  // Desactiver les tokens invalides
  if (result.data) {
    for (let i = 0; i < result.data.length; i++) {
      const ticket = result.data[i];
      if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
        await supabase
          .from("push_tokens")
          .update({ is_active: false })
          .eq("token", tokens[i]!.token);
      }
    }
  }

  return new Response(JSON.stringify({ sent: messages.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
