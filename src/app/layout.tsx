import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { siteConfig } from "@/lib/siteConfig";

// DM Sans ships with the site (variable weight 400-700), so builds never
// depend on downloading Google Fonts.
const dmSans = localFont({
  src: "./fonts/DMSans-latin-variable.woff2",
  variable: "--font-dm-sans",
  weight: "400 700",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Premium 1 Logistics LTD | Corporate Freight & Logistics Ghana, West Africa",
  description:
    "Corporate freight and logistics solutions across Ghana, West Africa and international corridors. Freight forwarding, customs clearance, warehousing, door-to-door delivery.",
  openGraph: {
    title: "Premium 1 Logistics LTD",
    description: "Corporate freight and logistics across Ghana, West Africa and international corridors.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_GH",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Premium 1 Logistics LTD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium 1 Logistics LTD",
    description: "Corporate freight and logistics across Ghana, West Africa and international corridors.",
    images: [siteConfig.ogImage],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: siteConfig.name,
  description:
    "Corporate freight and logistics solutions across Ghana, West Africa and international corridors.",
  url: siteConfig.url,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: siteConfig.email,
    },
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: siteConfig.operationsEmail,
    },
  ],
  sameAs: siteConfig.sameAs,
  address: { "@type": "PostalAddress", streetAddress: siteConfig.addressLine, addressLocality: "Accra", addressCountry: "GH" },
  areaServed: ["GH", "West Africa", "ECOWAS"],
  serviceType: [
    "Freight Forwarding",
    "Ship Agency",
    "Customs Clearance",
    "Warehousing",
    "Door-to-Door Delivery",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${dmSans.variable} bg-paper font-sans antialiased overflow-x-hidden`}>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
