import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

/**
 * Consume the ref_code cookie and insert a referrals row with status='signed_up'.
 * Called from the signup flow once the new user is authenticated.
 */
export async function POST(_req: NextRequest) {
  const jar = cookies();
  const refCode = jar.get("ref_code")?.value;
  if (!refCode) {
    return NextResponse.json({ ok: true, claimed: false });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Find referrer by their profile.referral_code
  const { data: referrer } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", refCode)
    .maybeSingle();

  if (!referrer || referrer.id === user.id) {
    jar.delete("ref_code");
    return NextResponse.json({ ok: true, claimed: false });
  }

  // Fetch user email
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ ok: false, error: "no_profile" }, { status: 400 });
  }

  const uniqueCode = `${refCode}-${user.id.slice(0, 8)}`;

  const { error: insertErr } = await admin.from("referrals").insert({
    referrer_id: referrer.id,
    referred_email: user.email || null,
    referred_user_id: user.id,
    code: uniqueCode,
    status: "signed_up",
    reward_cents: 0,
    converted_at: new Date().toISOString(),
  });

  if (insertErr && !insertErr.message.includes("duplicate")) {
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  jar.delete("ref_code");
  return NextResponse.json({ ok: true, claimed: true });
}
