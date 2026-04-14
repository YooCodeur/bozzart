/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bozzart/ui", "@bozzart/api", "@bozzart/core"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  headers: async () => [
    {
      // Allow embed pages to be iframed from any origin (Phase 21 widget)
      source: "/embed/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        { key: "X-Frame-Options", value: "ALLOWALL" },
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors *;",
        },
      ],
    },
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
            "img-src 'self' data: blob: https://*.supabase.co https://*.r2.cloudflarestorage.com https://unpkg.com https://picsum.photos",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src https://js.stripe.com https://hooks.stripe.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
          ].join("; "),
        },
      ],
    },
  ],
};

module.exports = nextConfig;
