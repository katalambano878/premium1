import type { Metadata, Viewport } from "next";
import { DM_Sans, Libre_Bodoni, Syne } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { siteConfig } from "@/lib/siteConfig";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const libreBodoni = Libre_Bodoni({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
      <body className={`${dmSans.variable} ${syne.variable} ${libreBodoni.variable} bg-paper font-sans antialiased overflow-x-hidden`}>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
