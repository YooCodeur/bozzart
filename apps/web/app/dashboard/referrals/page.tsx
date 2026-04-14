import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { CopyReferralLink } from "@/components/referrals/copy-referral-link";

export const metadata = {
  title: "Programme de parrainage — Bozzart",
};

export default async function ReferralsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, display_name")
    .eq("id", user.id)
    .single();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referred_email, status, reward_cents, created_at, converted_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const rows = referrals || [];
  const invitesSent = rows.length;
  const converted = rows.filter((r) => r.status === "signed_up" || r.status === "first_sale").length;
  const totalRewardsCents = rows.reduce((s, r) => s + (r.reward_cents || 0), 0);

  const code = profile?.referral_code || "";
  const shareUrl = code ? `https://bozzart.com/r/${code}` : "";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold">Programme de parrainage</h1>
      <p className="mt-2 text-sm text-gray-500">
        Partagez Bozzart avec d&apos;autres artistes et collectionneurs, et gagnez des récompenses quand ils nous rejoignent.
      </p>

      <section className="mt-8 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-500">Votre code</h2>
        <p className="mt-2 font-mono text-2xl font-semibold">{code || "—"}</p>
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Votre lien de parrainage</p>
          <CopyReferralLink url={shareUrl} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Invitations envoyées" value={invitesSent} />
        <Stat label="Inscrits parrainés" value={converted} />
        <Stat label="Récompenses totales" value={`${(totalRewardsCents / 100).toFixed(2)} €`} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Vos parrainages</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Aucun parrainage pour l&apos;instant.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Email</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Récompense</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-3">{r.referred_email || "—"}</td>
                  <td className="py-3">{r.status}</td>
                  <td className="py-3">{((r.reward_cents || 0) / 100).toFixed(2)} €</td>
                  <td className="py-3 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
