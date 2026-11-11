import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

const faqs = [
  {
    q: "What documents do I need to import general cargo?",
    a: "Usually a commercial invoice, packing list, bill of lading or air waybill, an Import Declaration Form, and any permits specific to your goods. We send you a checklist for your exact products before anything is filed.",
  },
  {
    q: "Which ports do you cover?",
    a: "Tema and Takoradi are our main ports, with support through Accra when a shipment needs it.",
  },
  {
    q: "How is the price broken down?",
    a: "Our service fee and the third-party costs are listed separately for each leg of the journey, with the assumptions stated before you book.",
  },
  {
    q: "How early should we book sea freight?",
    a: "For most ocean routes into Ghana, two to three weeks before the cargo is ready is a safe baseline. Peak periods often need longer, and we will tell you the booking window for your route.",
  },
  {
    q: "Can you handle oversize or heavy cargo?",
    a: "Yes. We arrange the route survey, permits, escorts and movement windows based on the size of the load and the rules on the route.",
  },
  {
    q: "Do you deliver to neighbouring countries?",
    a: "Yes. We run cross-border deliveries to regional destinations, subject to route, permit and border requirements.",
  },
  {
    q: "Can you manage our regular shipments, not just one?",
    a: "Yes. For recurring imports we agree a schedule, service levels and a single report covering all your shipments.",
  },
];

export function Faq() {
  return (
    <section className="relative bg-paper-soft py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            Questions importers{" "}
            <span className="italic text-[var(--accent-ink)]">ask us first.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-ink-muted sm:text-lg">
            If yours is not here, send it with your quote request and we will answer it in the reply.
          </p>
          <Link href="/contact" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-[var(--accent-ink)]">
            <span className="border-b border-[var(--navy)] pb-0.5 transition-colors group-hover:border-[var(--accent-ink)]">Ask a different question</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="border-t border-[var(--navy)]">
          {faqs.map((item, idx) => (
            <details key={item.q} open={idx === 0} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-editorial text-xl leading-snug text-ink sm:text-2xl">{item.q}</span>
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-ink ring-line transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45">
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-base leading-7 text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
