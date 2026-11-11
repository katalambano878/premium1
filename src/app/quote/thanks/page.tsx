import { ThanksClient } from "./ThanksClient";
import { Check } from "lucide-react";

export const metadata = {
  title: "Thank You | Premium 1 Logistics",
  description: "Your quote request was received.",
};

export default async function QuoteThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;
  const ref = no || "Pending";

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto mb-8 flex max-w-xl items-center gap-4 sm:gap-5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--accent-ink)]">
          <Check className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]">Thank you</h1>
          <p className="mt-1 text-base leading-7 text-slate-600 sm:text-lg">We have your quote request.</p>
        </div>
      </div>
      <ThanksClient inquiryNo={ref} />
    </section>
  );
}
