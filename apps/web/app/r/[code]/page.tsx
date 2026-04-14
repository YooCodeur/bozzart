import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: { code: string };
}

export const dynamic = "force-dynamic";

export default function ReferralLandingPage({ params }: Props) {
  const code = params.code.trim();
  if (code) {
    cookies().set("ref_code", code, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      sameSite: "lax",
    });
  }
  redirect("/signup");
}
