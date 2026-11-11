import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { SITE_SETTINGS } from "@/lib/mock";

const navColumns = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/how-we-operate", label: "How we work" },
      { href: "/coverage", label: "Coverage" },
      { href: "/insights", label: "Guides" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    heading: "Services",
    links: [
      { href: "/services/freight-forwarding", label: "Freight forwarding" },
      { href: "/services/customs-clearance", label: "Customs clearance" },
      { href: "/services/inland-transportation-hauls", label: "Inland delivery" },
      { href: "/services", label: "All services" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/quote", label: "Get a quote" },
      { href: "/track", label: "Track a shipment" },
      { href: "/contact", label: "Contact" },
      { href: "/testimonials", label: "Testimonials" },
    ],
  },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

const socialLinks = [
  { href: SITE_SETTINGS.social.instagram, label: "Instagram", icon: Instagram },
  { href: SITE_SETTINGS.social.facebook, label: "Facebook", icon: Facebook },
  { href: SITE_SETTINGS.social.linkedin, label: "LinkedIn", icon: Linkedin },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-3 pb-3 pt-6 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-6 text-white sm:rounded-[2rem] sm:px-10 lg:px-14">
        <div className="grid gap-12 py-12 sm:py-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 overflow-hidden rounded-full bg-white/10">
                <Image src="/premium1-logo-tight.png" alt="" width={88} height={88} className="h-11 w-11 object-cover" />
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-semibold tracking-[-0.01em]">Premium 1</span>
                <span className="block text-[11px] tracking-[0.16em] text-white/70">LOGISTICS</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/70">
              Freight forwarding, customs clearance and inland delivery for companies importing into Ghana.
            </p>
            <Link
              href="/quote"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white py-3 pl-6 pr-5 text-sm font-medium text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)] active:scale-[0.97]"
            >
              Get a quote
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {navColumns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-sm text-white/55">{col.heading}</h4>
                <ul className="mt-4 space-y-3 text-[15px] text-white/90">
                  {col.links.map((item) => (
                    <li key={item.href + item.label}>
                      <Link href={item.href} className="transition-colors hover:text-[var(--accent)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm text-white/55">Contact</h4>
            <ul className="mt-4 space-y-4 text-[15px] text-white/90">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span className="leading-6">{SITE_SETTINGS.address}</span>
              </li>
              <li>
                <a href={`tel:${SITE_SETTINGS.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 transition-colors hover:text-[var(--accent)]">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  {SITE_SETTINGS.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE_SETTINGS.email}`} className="flex items-center gap-3 break-all transition-colors hover:text-[var(--accent)]">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  {SITE_SETTINGS.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex gap-2.5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_SETTINGS.company_name}
          </p>
          <ul className="flex gap-6">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
