import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServerClient();
  const { data: artwork } = await supabase
    .from("artworks")
    .select("title, primary_image_url, artist:artist_profiles(full_name)")
    .eq("id", params.id)
    .maybeSingle();

  const title = artwork?.title || "Bozzart";
  const artistName =
    (artwork?.artist as unknown as { full_name: string } | null)?.full_name ||
    "Bozzart";
  const imageUrl = artwork?.primary_image_url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 56,
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        >
          <div style={{ fontSize: 24, opacity: 0.7 }}>bozzart.com</div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginTop: 16 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, opacity: 0.85, marginTop: 12 }}>par {artistName}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
