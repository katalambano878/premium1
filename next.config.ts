import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Next resizes every photo to the size each screen needs and serves AVIF (WebP fallback).
    formats: ["image/avif", "image/webp"],
    qualities: [55, 70, 75, 80, 85, 90],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Files in /public keep their names between deploys; cache them for a week.
        source: "/:file*.(webp|jpg|jpeg|png|svg|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
  async redirects() {
    // One canonical host: www sends visitors to the bare domain.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.premium1logistics.com" }],
        destination: "https://premium1logistics.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
