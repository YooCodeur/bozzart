import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Bozzart";
  const subtitle = searchParams.get("subtitle") || "Marketplace d'art contemporain";
  const imageUrl = searchParams.get("image");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4,
            }}
            alt=""
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            bozzart.art
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2, maxWidth: 800 }}>
            {title}
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.8)", marginTop: 16 }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
