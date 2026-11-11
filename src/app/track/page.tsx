import { CTAButton } from "@/components/design-system";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { TrackLookup } from "@/components/track/TrackLookup";
import { Bell, Check, Code2, FileSearch, Lock, Package, ShieldCheck, Smartphone } from "lucide-react";

export const metadata = {
  title: "Track Shipments | Premium 1 Logistics LTD",
  description:
    "Client visibility portal for milestones, documents, and POD — rolling out for account holders.",
};

const roadmap = [
  {
    phase: "Phase 1 (Live)",
    title: "Proactive updates",
    items: [
      "Milestone emails & WhatsApp digests",
      "Named operations contact per shipment",
      "Document close-out packs on request",
      "Exception alerts with options",
    ],
  },
  {
    phase: "Phase 2 (planned)",
    title: "Client portal",
    items: [
      "Secure web login with shipment list",
      "Download cleared docs & PODs",
      "Push notifications for customs events",
      "Live vessel and truck ETA feeds",
    ],
  },
  {
    phase: "Phase 3 (planned)",
    title: "Enterprise integrations",
    items: [
      "API webhooks for your ERP/TMS",
      "Role-based access for finance vs. ops",
      "SLA dashboard for enterprise accounts",
      "Carbon emissions reporting per lane",
    ],
  },
];

const features = [
  {
    icon: Bell,
    title: "Leg-based updates",
    description:
      "We push updates for key milestones: Sailed, Arrived at port, Under clearance, Released, Out for delivery, and POD.",
  },
  {
    icon: FileSearch,
    title: "Document vault",
    description:
      "Stop searching through email threads. Request a zipped close-out pack with all invoices, B/Ls, and declarations tied to your shipment.",
  },
  {
    icon: Smartphone,
    title: "WhatsApp ops line",
    description:
      "A dedicated channel for active shipments. It keeps the noise down, response times up, and urgent issues visible to the right people immediately.",
  },
  {
    icon: Package,
    title: "One reference per shipment",
    description:
      "Every booking gets one master reference. Quote it on any communication, and our team instantly pulls the full context.",
  },
];

const portalPlans = [
  {
    icon: Lock,
    title: "Security first",
    desc: "Verified company domains, optional 2FA, and strict role separation. Junior staff never see commercial rates. Penetration testing required before GA.",
  },
  {
    icon: Code2,
    title: "API webhooks",
    desc: "Don't want to log in? We will push milestones directly into your ERP or TMS (SAP, Oracle, CargoWise) via secure webhooks.",
  },
  {
    icon: ShieldCheck,
    title: "Audit trails",
    desc: "Immutable logs of every document uploaded, customs status change, and milestone achieved. Vital for compliance and insurance claims.",
  },
];

const pill = "inline-flex self-start rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const h2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]";

export default function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Tracking"
        title="Track your shipment"
        description="We are rolling out a secure client area for active account holders. Until your login is provisioned, you get the same milestones through email and WhatsApp with full audit trails."
        crumbs={[{ label: "Home", href: "/" }, { label: "Track" }]}
        backgroundImage="/hero/customs-gate.webp"
      />

      {/* Lookup */}
      <section className="mx-auto grid max-w-[1320px] items-start gap-8 px-6 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col">
          <span className={pill}>Shipment lookup</span>
          <h2 className={`mt-6 max-w-md ${h2}`}>Enter your reference</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Enter your shipment or inquiry reference number to see real-time status and milestones.
          </p>
        </div>
        <TrackLookup />
      </section>

      {/* What you get today */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <AnimateOnScroll animation="fade-up" className="flex flex-col">
          <span className={pill}>What you get today</span>
          <h2 className={`mt-6 max-w-md ${h2}`}>No more guessing where your cargo is</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            While our self-serve portal is in development, our operations team keeps you informed. We don&apos;t wait for you to ask; we push the updates you need, when you need them.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-up" delay={80}>
          <ul className="border-b border-slate-200">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex items-start gap-4 border-t border-slate-200 py-6">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block text-lg font-medium text-[var(--navy)] sm:text-xl">{feature.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">{feature.description}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </AnimateOnScroll>
      </section>

      {/* Planned for the portal (navy panel) */}
      <section className="px-3 py-6 sm:px-5">
        <div className="mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
          <span className="inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85">Client portal</span>
          <h2 className="mt-6 max-w-xl text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
            Security and integrations planned for the portal
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
            When the portal goes live, it will meet the strict security and integration requirements of global procurement teams.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {portalPlans.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="rounded-3xl border border-white/15 bg-white/5 p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-5 text-xl font-medium tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">{item.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col">
            <span className={pill}>Roadmap</span>
            <h2 className={`mt-6 ${h2}`}>What we are building</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              We are actively building the digital tools our high-volume clients have requested, phasing rollouts to ensure stability.
            </p>
          </div>
          <CTAButton variant="outline" href="/contact" className="self-start md:self-auto">
            Request beta access
          </CTAButton>
        </div>

        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {roadmap.map((col, i) => {
            const isActive = i === 0;
            return (
              <li key={col.phase} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-lg tabular-nums text-slate-400">0{i + 1}</span>
                  <span
                    className={`inline-flex rounded-full border px-3.5 py-1 text-[13px] ${
                      isActive ? "border-[var(--navy)] bg-[var(--navy)] text-white" : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {col.phase}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">{col.title}</h3>
                <ul className="mt-5">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 border-t border-slate-200 py-3 text-base leading-7 text-slate-600">
                      <Check className={`mt-1.5 h-4 w-4 shrink-0 ${isActive ? "text-[var(--accent-ink)]" : "text-slate-400"}`} strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <SiteCTA />
    </>
  );
}
