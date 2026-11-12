import Image from "next/image";
import { CTAButton } from "@/components/design-system/CTAButton";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { MOCK_COVERAGE } from "@/lib/mock";
import { TRANSIT_BANDS } from "@/lib/richContent";
import { ArrowRight, ArrowUpRight, Clock3, Globe, MapPinned, Plane, Route, ShieldCheck, Ship, Truck } from "lucide-react";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";

export const metadata = {
  title: "Coverage & Routes | Premium 1 Logistics LTD",
  description:
    "Logistics coverage across Ghana, the West Africa corridor, and international trade lanes.",
};

const regionIcons = [MapPinned, Route, Globe];

const tiers = [
  { icon: MapPinned, label: "Domestic execution", note: "Ports, ICDs, warehouse and final-mile coordination in Ghana." },
  { icon: Route, label: "Regional corridors", note: "Transit planning into landlocked markets with bond and border governance." },
  { icon: Globe, label: "International lanes", note: "Ocean and air main leg bookings with lane-specific control." },
];

const corridors = [
  {
    from: "Tema / Takoradi",
    to: "Ouagadougou / Bamako",
    mode: "Road + transit",
    note: "Bonded transit, escorts as required",
    icon: Truck,
  },
  {
    from: "Tema",
    to: "Accra ICD / Kumasi",
    mode: "Road",
    note: "Container drays, loose cargo",
    icon: Truck,
  },
  {
    from: "Lagos / Lomé",
    to: "Ghana",
    mode: "Sea / road",
    note: "Feeder and cross-border",
    icon: Ship,
  },
  {
    from: "Asia / Europe",
    to: "Ghana",
    mode: "Sea / air",
    note: "FCL, LCL, charter for project",
    icon: Plane,
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Route feasibility first",
    body: "We validate infrastructure, permits, and handling constraints before quoting so execution risk is visible early.",
  },
  {
    icon: Clock3,
    title: "Time-band transparency",
    body: "Transit timelines are provided as practical bands with lane assumptions, not optimistic headline dates.",
  },
  {
    icon: Truck,
    title: "One point of accountability",
    body: "Even where partner agents are used, you keep one quote, one operations contact, and one escalation owner.",
  },
];

const labelPill = "inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const h2Class = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]";

export default function CoveragePage() {
  const [home, ...otherRegions] = MOCK_COVERAGE;

  return (
    <>
      <PageHero
        eyebrow="Coverage"
        title="Where we move cargo — local depth, regional reach"
        description="Ghana is our home base. We routinely coordinate into ECOWAS landlocked states and book international main carriage on major trade lanes."
        crumbs={[{ label: "Home", href: "/" }, { label: "Coverage" }]}
        backgroundImage="/hero-slide-2.webp"
      />

      {/* Network: intro + three coverage tiers */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <span className={labelPill}>Our network</span>
            <h2 className={`mt-6 max-w-md ${h2Class}`}>Three tiers of coverage, one operations standard</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
              Local depth in Ghana, corridor execution across ECOWAS, and global main-carriage coordination through trusted line and airline partners.
            </p>

            <ul className="mt-8 space-y-6">
              {tiers.map(({ icon: Icon, label, note }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block text-base font-medium text-[var(--navy)]">{label}</span>
                    <span className="mt-1 block max-w-sm text-sm leading-6 text-slate-500">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Home region as a photo card */}
            <article className="relative isolate flex min-h-[24rem] flex-col justify-between overflow-hidden rounded-3xl p-5 text-white sm:col-span-2 sm:min-h-[26rem] sm:p-6">
              <Image src="/services-hero.webp" alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="-z-10 object-cover" />
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.35)_0%,rgba(8,20,40,0.2)_30%,rgba(8,20,40,0.92)_100%)]" aria-hidden />

              <ul className="flex flex-wrap gap-2" aria-label={`Cities covered in ${home.region}`}>
                {home.cities.map((city) => (
                  <li key={city} className="rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md">
                    {city}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <p className="text-sm text-white/85">{home.tagline}</p>
                <h3 className="mt-1 text-2xl font-medium tracking-[-0.01em] sm:text-3xl">{home.region}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">{home.detail}</p>
              </div>
            </article>

            {otherRegions.map((c, i) => {
              const Icon = regionIcons[i + 1] || Globe;
              return (
                <article key={c.region} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <p className="mt-6 text-sm text-slate-500">{c.tagline}</p>
                  <h3 className="mt-1 text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">{c.region}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{c.detail}</p>
                  <ul className="mt-6 flex flex-wrap gap-2 pt-1" aria-label={`Places covered: ${c.region}`}>
                    {c.cities.map((city) => (
                      <li key={city} className="rounded-full border border-slate-200 px-3 py-1 text-[13px] text-slate-600">
                        {city}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample corridors: navy panel with numbered rows */}
      <section className="px-3 py-6 sm:px-5">
        <div className="relative isolate overflow-hidden mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
          <ParallaxBackdrop src="/hero-slide-1.webp" />
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85">Sample corridors</span>
              <h2 className="mt-6 max-w-md text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
                Lanes we run frequently
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-white/75">
                These are representative flows across domestic, regional, and international movements. Each live quote includes lane-specific assumptions.
              </p>
            </div>

            <ol className="border-b border-white/15">
              {corridors.map((route, i) => {
                const ModeIcon = route.icon;
                return (
                  <li
                    key={route.from + route.to}
                    className="grid grid-cols-[2rem_1fr] items-start gap-x-4 gap-y-3 border-t border-white/15 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-x-6"
                  >
                    <span className="text-lg tabular-nums text-white/70">0{i + 1}</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-lg font-medium sm:text-xl">
                        <span>{route.from}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                        <span className="sr-only">to</span>
                        <span>{route.to}</span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/75">{route.note}</p>
                    </div>
                    <span className="col-start-2 inline-flex items-center gap-2 justify-self-start rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium sm:col-start-3 sm:justify-self-end">
                      <ModeIcon className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                      {route.mode}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Transit bands: table in a white card */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className={labelPill}>Transit times</span>
            <h2 className={`mt-6 max-w-xl ${h2Class}`}>Typical transit bands by lane</h2>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white sm:mt-10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th scope="col" className="px-6 py-4 font-normal sm:px-8">Lane</th>
                  <th scope="col" className="px-4 py-4 font-normal">Sea</th>
                  <th scope="col" className="px-4 py-4 font-normal">Air</th>
                  <th scope="col" className="px-6 py-4 font-normal sm:px-8">Notes</th>
                </tr>
              </thead>
              <tbody>
                {TRANSIT_BANDS.map((band) => (
                  <tr key={band.lane} className="border-t border-slate-200 align-top">
                    <th scope="row" className="px-6 py-5 text-base font-medium text-[var(--navy)] sm:px-8">
                      {band.lane}
                    </th>
                    <td className="whitespace-nowrap px-4 py-5 text-base tabular-nums text-slate-600">
                      {band.sea !== "—" ? band.sea : <span className="text-slate-400">—<span className="sr-only">Not applicable</span></span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-base tabular-nums text-slate-600">
                      {band.air !== "—" ? band.air : <span className="text-slate-400">—<span className="sr-only">Not applicable</span></span>}
                    </td>
                    <td className="px-6 py-5 text-sm leading-6 text-slate-500 sm:px-8">{band.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How we run coverage: numbered principles + lane check */}
      <section className="mx-auto max-w-[1320px] px-6 pb-12 sm:pb-16">
        <div className="max-w-2xl">
          <span className={labelPill}>How we run coverage</span>
          <h2 className={`mt-6 ${h2Class}`}>Commercial clarity meets route reality</h2>
        </div>

        <ol className="mt-10 grid gap-x-10 lg:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="border-t border-slate-200 py-7">
              <div className="flex items-center justify-between">
                <span className="text-lg tabular-nums text-slate-400">0{i + 1}</span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-[var(--navy)] sm:text-xl">{title}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div>
            <h2 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">Don&apos;t see your lane? We likely cover it</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              We partner with vetted agents on lanes we don&apos;t self-perform. You still get one quote and one operations contact — we manage the handoffs.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <CTAButton href="/quote" variant="secondary">
              Request coverage check
              <ArrowUpRight className="h-4 w-4" />
            </CTAButton>
            <CTAButton href="/contact" variant="outline">
              Talk to our team
            </CTAButton>
          </div>
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
