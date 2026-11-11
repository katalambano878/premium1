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
    unoptimized: true,
    qualities: [75, 80, 82, 85, 90],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
