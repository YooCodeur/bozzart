import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  switch (event.type) {
    // ─── Paiement reussi ───
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const transactionId = paymentIntent.metadata.transactionId;
      if (!transactionId) break;

      // 1. Mettre a jour la transaction
      await supabase
        .from("transactions")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq("id", transactionId);

      // 2. Recuperer la transaction complete
      const { data: transaction } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (!transaction) break;

      // 3. Marquer l'oeuvre comme vendue
      await supabase
        .from("artworks")
        .update({ status: "sold" })
        .eq("id", transaction.artwork_id);

      // 4. Ajouter a la collection acheteur (si pas guest)
      if (transaction.buyer_id) {
        await supabase.from("buyer_collections").insert({
          user_id: transaction.buyer_id,
          transaction_id: transactionId,
          artwork_id: transaction.artwork_id,
          artist_id: transaction.artist_id,
          purchased_at: new Date().toISOString(),
        });
      }

      // 5. Transfert vers l'artiste
      const { data: artist } = await supabase
        .from("artist_profiles")
        .select("stripe_account_id")
        .eq("id", transaction.artist_id)
        .single();

      if (artist?.stripe_account_id) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(transaction.artist_amount * 100),
          currency: transaction.currency.toLowerCase(),
          destination: artist.stripe_account_id,
          metadata: { transactionId },
        });

        await supabase
          .from("transactions")
          .update({
            stripe_transfer_id: transfer.id,
            transferred_at: new Date().toISOString(),
          })
          .eq("id", transactionId);
      }

      // 6. Generer le certificat (appel a l'autre Edge Function)
      await supabase.functions.invoke("generate-certificate", {
        body: { transactionId },
      });

      // 7. Notification artiste
      await supabase.from("notifications").insert({
        user_id: artist?.stripe_account_id ? transaction.artist_id : transaction.artist_id,
        type: "sale",
        title: "Vente realisee !",
        body: `Votre oeuvre a ete vendue pour ${transaction.amount} ${transaction.currency}`,
        data: { transactionId, artworkId: transaction.artwork_id },
        deep_link: `/dashboard/messages`,
      });

      // 8. Notification artiste via user_id
      const { data: artistProfile } = await supabase
        .from("artist_profiles")
        .select("user_id")
        .eq("id", transaction.artist_id)
        .single();

      if (artistProfile) {
        // Envoyer push notification
        await supabase.functions.invoke("send-push-notification", {
          body: {
            userId: artistProfile.user_id,
            title: "Vente realisee !",
            body: `Votre oeuvre a ete vendue pour ${transaction.amount} ${transaction.currency}`,
            data: { transactionId },
            deepLink: "/dashboard/messages",
          },
        });
      }

      break;
    }

    // ─── Transfert verse ───
    case "transfer.paid": {
      const transfer = event.data.object as Stripe.Transfer;
      const transactionId = transfer.metadata.transactionId;
      if (!transactionId) break;

      await supabase
        .from("transactions")
        .update({ payout_at: new Date().toISOString() })
        .eq("id", transactionId);

      // Notification payout
      const { data: tx } = await supabase
        .from("transactions")
        .select("artist_id, amount, currency")
        .eq("id", transactionId)
        .single();

      if (tx) {
        const { data: artistProfile } = await supabase
          .from("artist_profiles")
          .select("user_id")
          .eq("id", tx.artist_id)
          .single();

        if (artistProfile) {
          await supabase.from("notifications").insert({
            user_id: artistProfile.user_id,
            type: "payout_sent",
            title: "Virement envoye",
            body: `${tx.amount} ${tx.currency} a ete vire sur votre compte`,
            data: { transactionId },
          });
        }
      }

      break;
    }

    // ─── Paiement echoue ───
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const transactionId = paymentIntent.metadata.transactionId;
      if (!transactionId) break;

      await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", transactionId);

      break;
    }

    // ─── Abonnement cree / mis a jour (Phase 18) ───
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const meta = sub.metadata || {};
      const planId = meta.plan_id;
      const artistId = meta.artist_id;
      const subscriberId = meta.subscriber_id;
      if (!planId || !artistId || !subscriberId) break;

      const statusMap: Record<string, string> = {
        active: "active",
        trialing: "active",
        past_due: "past_due",
        unpaid: "past_due",
        canceled: "canceled",
        incomplete: "past_due",
        incomplete_expired: "expired",
        paused: "past_due",
      };
      const mapped = statusMap[sub.status] ?? "past_due";

      await supabase
        .from("subscriptions")
        .upsert(
          {
            subscriber_id: subscriberId,
            plan_id: planId,
            artist_id: artistId,
            status: mapped,
            stripe_subscription_id: sub.id,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            canceled_at: sub.canceled_at
              ? new Date(sub.canceled_at * 1000).toISOString()
              : null,
          },
          { onConflict: "stripe_subscription_id" },
        );
      break;
    }

    // ─── Abonnement supprime (Phase 18) ───
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    // ─── Mise a jour compte Connect ───
    case "account.updated": {
      const account = event.data.object as Stripe.Account;

      await supabase
        .from("artist_profiles")
        .update({
          stripe_onboarded: account.details_submitted ?? false,
          stripe_payouts_enabled: account.payouts_enabled ?? false,
        })
        .eq("stripe_account_id", account.id);

      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
