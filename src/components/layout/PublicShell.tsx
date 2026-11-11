"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/auth/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="site-v3">
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <CookieConsent />
    </div>
  );
}
