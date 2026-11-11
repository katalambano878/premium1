"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { GHANA_REGIONS, GHANA_VIEWBOX } from "@/lib/ghanaMap";

type Hub = {
  id: string;
  name: string;
  role: string;
  note: string;
  region: string;
  coord: string;
  x: number;
  y: number;
  label: "left" | "right";
};

/** Projected into the Ghana viewBox (lng −3.26…1.20, lat 4.74…11.17). */
const hubs: Hub[] = [
  {
    id: "tamale",
    coord: "9.40°N 0.84°W",
    name: "Tamale",
    role: "Northern gateway",
    note: "The last major stop before the northern border. Cargo for Burkina Faso and the Sahel is routed through here.",
    region: "northern",
    x: 195,
    y: 149,
    label: "right",
  },
  {
    id: "kumasi",
    coord: "6.69°N 1.62°W",
    name: "Kumasi",
    role: "Inland hub",
    note: "Deliveries for the middle of the country. Cargo cleared at the coast moves through Kumasi on its way north or west.",
    region: "ashanti",
    x: 132,
    y: 376,
    label: "left",
  },
  {
    id: "takoradi",
    coord: "4.90°N 1.76°W",
    name: "Takoradi",
    role: "Western port",
    note: "Ghana's western port. We clear project cargo, mining and oil-service freight that lands here.",
    region: "western",
    x: 122,
    y: 512,
    label: "left",
  },
  {
    id: "accra",
    coord: "5.60°N 0.19°W",
    name: "Accra",
    role: "Head office",
    note: "Our office is in Airport Residential. Your quote and your shipment updates come from the team here, and air cargo arrives nearby.",
    region: "greater-accra",
    x: 236,
    y: 458,
    label: "left",
  },
  {
    id: "tema",
    coord: "5.67°N 0.02°W",
    name: "Tema",
    role: "Main port",
    note: "Ghana's main container port. Most imports land here, so this is where most clearances and deliveries begin.",
    region: "greater-accra",
    x: 268,
    y: 448,
    label: "right",
  },
];

const corridors = ["Abidjan", "Lomé", "Lagos", "Cotonou", "Ouagadougou", "Bamako"];

const routes = [
  ["tema", "kumasi"],
  ["kumasi", "tamale"],
  ["accra", "takoradi"],
] as const;

function hubById(id: string) {
  return hubs.find((hub) => hub.id === id)!;
}

/** Graticule in the same projection as the hubs: x = 263 + 81·lng, y = 149 + 80.7·(9.40 − lat). */
const meridians = [
  { x: 20, label: "3°W" },
  { x: 101, label: "2°W" },
  { x: 182, label: "1°W" },
  { x: 263, label: "0° Greenwich" },
  { x: 344, label: "1°E" },
];

const parallels = [
  { y: 20, label: "11°N" },
  { y: 101, label: "10°N" },
  { y: 181, label: "9°N" },
  { y: 262, label: "8°N" },
  { y: 343, label: "7°N" },
  { y: 423, label: "6°N" },
  { y: 504, label: "5°N" },
];

export function CorridorAtlas() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState("tema");
  const active = hubById(activeId);

  return (
    <section id="coverage-atlas" className="relative bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            From the port to{" "}
            <span className="italic text-[var(--accent-ink)]">anywhere in Ghana,</span>
            <br className="hidden sm:block" /> and across the border.
          </h2>
          <p className="max-w-md text-[15px] leading-7 text-ink-muted lg:justify-self-end lg:text-right">
            We clear cargo at the ports and deliver it inland. Select a city to see how it fits into your shipment.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[var(--navy)] px-4 py-6 text-white sm:px-8 sm:py-8">
            <svg viewBox={GHANA_VIEWBOX} className="mx-auto h-auto w-full max-w-[460px]" role="img" aria-label="Map of Ghana showing the ports and cities Premium 1 serves">
              <g aria-hidden>
                {meridians.map((m) => (
                  <g key={m.label}>
                    <line x1={m.x} y1={12} x2={m.x} y2={540} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} />
                    <text x={m.x + 3} y={9} fill="rgba(255,255,255,0.5)" fontSize="7">
                      {m.label}
                    </text>
                  </g>
                ))}
                {parallels.map((p) => (
                  <g key={p.label}>
                    <line x1={0} y1={p.y} x2={360} y2={p.y} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} />
                    <text x={357} y={p.y - 3} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="7">
                      {p.label}
                    </text>
                  </g>
                ))}
              </g>

              {Object.entries(GHANA_REGIONS).map(([id, region]) => {
                const lit = active.region === id;
                return (
                  <path
                    key={id}
                    d={region.d}
                    fill={lit ? "#2ec4b6" : "#123a52"}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth={lit ? 1.4 : 0.7}
                    strokeLinejoin="round"
                    style={{ transition: "fill 220ms ease-out" }}
                  />
                );
              })}

              <text
                x={262}
                y={522}
                fill="rgba(184,243,236,0.6)"
                fontSize="10"
                fontStyle="italic"
                letterSpacing="1.2"
                style={{ fontFamily: "var(--font-editorial), Georgia, serif" }}
              >
                Gulf of Guinea
              </text>

              {routes.map(([from, to]) => {
                const a = hubById(from);
                const b = hubById(to);
                const hot = activeId === from || activeId === to;
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={hot ? "#ffffff" : "rgba(184,243,236,0.55)"}
                    strokeWidth={hot ? 1.8 : 1}
                    strokeDasharray="4 3"
                  />
                );
              })}

              {hubs.map((hub) => {
                const on = hub.id === activeId;
                const anchor = hub.label === "left" ? "end" : "start";
                const textX = hub.label === "left" ? hub.x - 10 : hub.x + 10;
                return (
                  <g key={hub.id} onMouseEnter={() => setActiveId(hub.id)} onClick={() => setActiveId(hub.id)} style={{ cursor: "pointer" }}>
                    <circle cx={hub.x} cy={hub.y} r={14} fill="transparent" />
                    {on ? <circle cx={hub.x} cy={hub.y} r={9} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.8} /> : null}
                    <circle cx={hub.x} cy={hub.y} r={on ? 5 : 3.6} fill={on ? "#ffffff" : "#0b1f3a"} stroke="#b8f3ec" strokeWidth={1.4} />
                    <text
                      x={textX}
                      y={hub.y + 4}
                      textAnchor={anchor}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="600"
                      style={{ fontFamily: "var(--font-editorial), Georgia, serif" }}
                    >
                      {hub.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <p className="mt-4 border-t border-white/15 pt-4 text-sm leading-6 text-white/75">
              Onward with partners to {corridors.slice(0, -1).join(", ")} and {corridors[corridors.length - 1]}.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="min-h-[15rem] border-t-2 border-[var(--navy)] pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="font-editorial text-6xl leading-none text-ink sm:text-7xl">{active.name}</h3>
                    <p className="text-sm tabular-nums text-ink-muted">{active.coord}</p>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[var(--accent-ink)]">{active.role}</p>
                  <p className="mt-4 max-w-lg text-lg leading-8 text-ink-muted">{active.note}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <ul className="mt-8 border-t border-line lg:mt-auto">
              {hubs.map((hub) => {
                const on = hub.id === activeId;
                return (
                  <li key={hub.id} className="border-b border-line">
                    <button
                      type="button"
                      aria-pressed={on}
                      onMouseEnter={() => setActiveId(hub.id)}
                      onFocus={() => setActiveId(hub.id)}
                      onClick={() => setActiveId(hub.id)}
                      className="grid w-full grid-cols-[1fr_auto] items-baseline gap-4 py-4 text-left"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className={`font-editorial text-xl transition-colors duration-200 ${on ? "italic text-[var(--accent-ink)]" : "text-ink"}`}>
                          {hub.name}
                        </span>
                        <span className="text-sm text-ink-muted">{hub.role}</span>
                      </span>
                      <span className="text-[13px] tabular-nums text-ink-muted">{hub.coord}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="font-editorial text-xl italic text-ink-muted sm:text-2xl">Delivering somewhere not on the map? Ask us.</p>
          <Link
            href="/coverage"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.98]"
          >
            See full coverage
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
