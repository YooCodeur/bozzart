"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

type Channel = "push" | "email" | "in_app";

const CATEGORIES: Array<{ key: string; label: string; prefix: string }> = [
  { key: "new_post_from_followed_artist", label: "Nouveaux posts d'artistes suivis", prefix: "new_post" },
  { key: "artist_live_starting",          label: "Artiste en live",                  prefix: "live" },
  { key: "subscription_expiring",         label: "Abonnement qui expire",            prefix: "sub" },
  { key: "price_drop_wishlist",           label: "Baisse de prix (wishlist)",        prefix: "price_drop" },
  { key: "commission_update",             label: "Mise a jour de commande",          prefix: "commission" },
  { key: "referral_converted",            label: "Parrainage converti",              prefix: "referral" },
  { key: "social_proof",                  label: "Preuve sociale",                   prefix: "social" },
  { key: "reengagement",                  label: "Re-engagement",                    prefix: "reengage" },
];

const CHANNELS: Array<{ key: Channel; label: string }> = [
  { key: "push",   label: "Push" },
  { key: "email",  label: "Email" },
  { key: "in_app", label: "In-app" },
];

function colName(prefix: string, channel: Channel): string {
  return `${prefix}_${channel}`;
}

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPrefs(data as Record<string, boolean>);
        setLoading(false);
      });
  }, [user]);

  function toggle(prefix: string, channel: Channel) {
    const col = colName(prefix, channel);
    setPrefs((p) => ({ ...p, [col]: !p[col] }));
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
    for (const cat of CATEGORIES) {
      for (const ch of CHANNELS) {
        const col = colName(cat.prefix, ch.key);
        payload[col] = prefs[col] ?? true;
      }
    }
    const { error } = await supabase.from("notification_preferences").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error("Erreur: " + error.message);
    else toast.success("Preferences enregistrees");
  }

  if (!user) return <div className="p-6">Connectez-vous.</div>;
  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Preferences de notifications</h1>
      <div className="overflow-x-auto rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-3 text-left">Categorie</th>
              {CHANNELS.map((c) => (
                <th key={c.key} className="p-3 text-center">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => (
              <tr key={cat.key} className="border-t border-neutral-200">
                <td className="p-3">{cat.label}</td>
                {CHANNELS.map((ch) => {
                  const col = colName(cat.prefix, ch.key);
                  const checked = prefs[col] ?? true;
                  return (
                    <td key={ch.key} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(cat.prefix, ch.key)}
                        aria-label={`${cat.label} - ${ch.label}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}
