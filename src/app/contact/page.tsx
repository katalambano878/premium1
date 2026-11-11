import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { SITE_SETTINGS } from "@/lib/mock";
import { siteConfig } from "@/lib/siteConfig";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Contact | Premium 1 Logistics LTD",
  description: "Contact Premium 1 Logistics — phone, WhatsApp, email, and quote requests.",
};

const cards = [
  {
    icon: Phone,
    label: "Phone",
    value: SITE_SETTINGS.phone,
    desc: "Call us for immediate assistance during business hours.",
    href: `tel:${SITE_SETTINGS.phone}`,
    action: "Call now",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with our team",
    desc: "Instant messaging for active shipments and fast queries.",
    href: SITE_SETTINGS.social.whatsapp,
    action: "Open chat",
    external: true,
  },
  {
    icon: Mail,
    label: "General email",
    value: SITE_SETTINGS.email,
    desc: "General enquiries, partnerships, and document submissions.",
    href: `mailto:${SITE_SETTINGS.email}`,
    action: "Send email",
  },
  {
    icon: Mail,
    label: "Operations email",
    value: SITE_SETTINGS.operationsEmail,
    desc: "Active shipments, port and clearance coordination, and day-to-day shipment questions.",
    href: `mailto:${SITE_SETTINGS.operationsEmail}`,
    action: "Email operations",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Accra, Ghana",
    desc: SITE_SETTINGS.address,
    href: "https://maps.google.com/?q=Accra+Ghana",
    action: "Get directions",
    external: true,
  },
];

const hours = [
  { day: "Mon – Fri", time: "8:00 – 18:00" },
  { day: "Saturday", time: "9:00 – 14:00" },
  { day: "Sunday", time: "Closed" },
];

const firstMessage = [
  "Origin and destination (city / port / ICD)",
  "Commodity type, approximate weight and volume",
  "Target delivery window and Incoterms if known",
  "Any permits, L/C, or inspection requirements",
];

const pill = "inline-flex self-start rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const h2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Speak with a logistics specialist"
        description={`Whether you have a live shipment, a tender, or a corridor you are exploring — we aim to respond within ${siteConfig.responseSlaHours} hours on business days and assign a named contact.`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        backgroundImage="/hero/freight-dawn.webp"
      />

      {/* Form + contact details */}
      <section className="mx-auto grid max-w-[1320px] items-start gap-6 px-6 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <AnimateOnScroll animation="fade-up">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-medium tracking-[-0.02em] text-[var(--navy)] sm:text-3xl">Send us a message</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
              For general enquiries, media, or partnership discussions. Need rates? It&apos;s faster to use our dedicated{" "}
              <Link href="/quote" className="font-medium text-[var(--navy)] underline decoration-[var(--navy)]/40 underline-offset-4 transition-colors hover:decoration-[var(--navy)]">
                quote request form
              </Link>
              .
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </AnimateOnScroll>

        <div className="space-y-6">
          <AnimateOnScroll animation="fade-up" delay={80}>
            <ul className="rounded-3xl border border-slate-200 bg-white px-6 py-2 sm:px-8">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <li key={card.label} className="border-t border-slate-200 first:border-t-0">
                    <a
                      href={card.href}
                      target={card.external ? "_blank" : undefined}
                      rel={card.external ? "noopener noreferrer" : undefined}
                      aria-label={`${card.label}: ${card.value}. ${card.action}`}
                      className="group flex items-start gap-4 py-5"
                    >
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)] transition-colors duration-200 group-hover:border-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-slate-500">{card.label}</span>
                        <span className="mt-0.5 block break-words text-base font-medium text-[var(--navy)]">{card.value}</span>
                        <span className="mt-1 block text-sm leading-6 text-slate-500">{card.desc}</span>
                      </span>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--navy)]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={140}>
            <div className="rounded-3xl bg-[var(--navy)] p-6 text-white sm:p-8">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                  <Clock className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div>
                  <h2 className="text-xl font-medium tracking-[-0.01em]">Opening hours</h2>
                  <p className="text-sm text-white/75">All times GMT</p>
                </div>
              </div>
              <dl className="mt-6">
                {hours.map((row) => (
                  <div key={row.day} className="flex items-center justify-between gap-4 border-t border-white/15 py-3.5 text-base">
                    <dt className="text-white/85">{row.day}</dt>
                    <dd className="font-medium tabular-nums">{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* What to include */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <AnimateOnScroll animation="fade-up" className="flex flex-col">
          <span className={pill}>Before you write</span>
          <h2 className={`mt-6 max-w-md ${h2}`}>What to include in your first message</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Help us give you an accurate answer on the first reply. Whether emailing or messaging us, these details speed things up.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-up" delay={80}>
          <ol className="border-b border-slate-200">
            {firstMessage.map((item, i) => (
              <li key={item} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-t border-slate-200 py-5 sm:grid-cols-[3.5rem_1fr]">
                <span className="text-lg tabular-nums text-slate-400">0{i + 1}</span>
                <span className="text-lg font-medium text-[var(--navy)] sm:text-xl">{item}</span>
              </li>
            ))}
          </ol>
        </AnimateOnScroll>
      </section>

      {/* Office + map */}
      <section className="mx-auto grid max-w-[1320px] gap-6 px-6 py-12 sm:py-16 lg:grid-cols-2">
        <AnimateOnScroll animation="fade-up">
          <div className="relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--navy)] p-6 text-white sm:min-h-[24rem] sm:p-8">
            <Image
              src="/contact-office.webp"
              alt="Premium 1 Logistics office"
              fill
              className="-z-10 object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,rgba(8,20,40,0.1)_35%,rgba(8,20,40,0.9)_100%)]" aria-hidden />
            <span className="inline-flex self-start rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md">
              Accra, Ghana
            </span>
            <h2 className="mt-4 text-xl font-medium tracking-[-0.01em] sm:text-2xl">Our office</h2>
            <p className="mt-1 text-base leading-7 text-white/85">{SITE_SETTINGS.address}</p>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-up" delay={80}>
          <div className="h-[20rem] overflow-hidden rounded-3xl border border-slate-200 bg-white sm:h-[24rem]">
            <iframe
              title="Office location"
              src={siteConfig.mapEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </AnimateOnScroll>
      </section>

      <SiteCTA />
    </>
  );
}
