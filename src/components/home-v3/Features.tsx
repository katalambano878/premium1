import { Layers, MessageSquareText, ReceiptText, UserRound } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const features = [
  { icon: Layers, title: "One team", body: "Freight, clearance and delivery under one company" },
  { icon: ReceiptText, title: "Clear pricing", body: "Every cost listed in your written quote" },
  { icon: UserRound, title: "Named contact", body: "The same person from quote to delivery" },
  { icon: MessageSquareText, title: `${siteConfig.responseSlaHours}-hour reply`, body: "To every quote request we receive" },
];

export function Features() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <li key={f.title} className="flex items-start gap-4">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                <Icon className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <span>
                <span className="block text-base font-medium text-[var(--navy)]">{f.title}</span>
                <span className="mt-1 block max-w-[13rem] text-sm leading-5 text-slate-500">{f.body}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
