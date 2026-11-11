"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { SITE_SETTINGS } from "@/lib/mock";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, MapPin, MessageCircle, Package, Ship, User } from "lucide-react";

const STEPS = [
  { id: "origin", title: "Route", icon: MapPin, subtitle: "Origin & destination" },
  { id: "cargo", title: "Cargo", icon: Package, subtitle: "Details & dimensions" },
  { id: "method", title: "Method", icon: Ship, subtitle: "Mode & requirements" },
  { id: "docs", title: "Contact", icon: User, subtitle: "Your details" },
];

const haveReady = [
  { title: "Route", body: "Where the cargo ships from and where it is going." },
  { title: "Cargo", body: "Type, dimensions, weight and quantity, if you know them." },
  { title: "Method and timeline", body: "Sea, air or road, plus any special requirements." },
  { title: "Your contact details", body: "Name, email and phone so we can reply." },
];

const nextSteps = [
  "Operations reviews your lane, commodity, and mode.",
  "We email a written quote or ask targeted follow-ups.",
  "On acceptance, you receive a shipment reference and checklist.",
];

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-[var(--navy)] placeholder:text-slate-400 transition-colors duration-200 focus:border-[var(--navy)] focus:outline-none";
const labelClass = "mb-2 block text-sm font-medium text-[var(--navy)]";

const benefits = [
  "Line-item quotations where applicable",
  "Named operations contact on confirmation",
  "24-hour response on complete enquiries",
  "Corridor experience: Ghana & ECOWAS",
];

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [trap, setTrap] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    cargo_type: "",
    dimensions: "",
    weight: "",
    quantity: "",
    method: "sea",
    requirements: "",
    name: "",
    company: "",
    email: "",
    phone: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          cargo: { type: form.cargo_type, dimensions: form.dimensions, weight: form.weight, quantity: form.quantity },
          method: form.method,
          requirements: form.requirements,
          full_name: form.name,
          company_name: form.company,
          email: form.email,
          phone: form.phone,
          website: trap || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.inquiry_no) {
        try {
          sessionStorage.setItem("lastInquiryId", data.id || "");
          sessionStorage.setItem("lastInquiryDemo", data.demo ? "1" : "0");
        } catch {
          /* */
        }
        router.push(`/quote/thanks?no=${encodeURIComponent(data.inquiry_no)}`);
        return;
      }
      alert(data.error || "Something went wrong. Email us or use WhatsApp.");
    } catch {
      alert("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const current = STEPS[step];

  return (
    <>
      <PageHero
        eyebrow="Quote request"
        title="Request a quote"
        description="Four short steps (~3 minutes). The more complete your inputs, the faster we respond — with fewer clarification rounds."
        crumbs={[{ label: "Home", href: "/" }, { label: "Quote" }]}
        backgroundImage="/hero/operations-desk.webp"
      />

      <section className="mx-auto grid max-w-[1320px] items-start gap-6 px-6 py-12 sm:py-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-8">
        {/* Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
          {/* Step navigation */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  className={`flex min-h-12 min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-[background-color,color,border-color] duration-200 ${
                    active
                      ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-[var(--navy)]"
                  }`}
                >
                  <span className={`shrink-0 text-sm tabular-nums ${active ? "text-white/75" : done ? "text-[var(--accent-ink)]" : "text-slate-400"}`}>
                    {done ? <Check className="h-4 w-4" strokeWidth={2} aria-label="Done" /> : `0${i + 1}`}
                  </span>
                  <span className="truncate text-sm font-medium">{s.title}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200" aria-hidden>
            <div
              className="h-full w-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>

          <form onSubmit={handleSubmit} className="relative mt-8">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute opacity-0 w-px h-px overflow-hidden"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
            />

            <p className="text-sm tabular-nums text-slate-500">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">{current.subtitle}</h2>

            <div className="mt-6">
              {step === 0 && (
                <div className="grid gap-5 animate-fade-up sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-origin" className={labelClass}>
                      Origin
                    </label>
                    <input
                      id="quote-origin"
                      type="text"
                      value={form.origin}
                      onChange={(e) => update("origin", e.target.value)}
                      className={fieldClass}
                      placeholder="City, port, or full address"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-destination" className={labelClass}>
                      Destination
                    </label>
                    <input
                      id="quote-destination"
                      type="text"
                      value={form.destination}
                      onChange={(e) => update("destination", e.target.value)}
                      className={fieldClass}
                      placeholder="Delivery point or port"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 animate-fade-up sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="quote-cargo-type" className={labelClass}>
                      Cargo type
                    </label>
                    <input
                      id="quote-cargo-type"
                      type="text"
                      value={form.cargo_type}
                      onChange={(e) => update("cargo_type", e.target.value)}
                      className={fieldClass}
                      placeholder="e.g. General cargo, machinery, chemicals"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-dimensions" className={labelClass}>
                      Dimensions (L×W×H cm)
                    </label>
                    <input
                      id="quote-dimensions"
                      type="text"
                      value={form.dimensions}
                      onChange={(e) => update("dimensions", e.target.value)}
                      className={fieldClass}
                      placeholder="e.g. 120x80x100"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-weight" className={labelClass}>
                      Weight (kg)
                    </label>
                    <input
                      id="quote-weight"
                      type="text"
                      value={form.weight}
                      onChange={(e) => update("weight", e.target.value)}
                      className={fieldClass}
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="quote-quantity" className={labelClass}>
                      Quantity
                    </label>
                    <input
                      id="quote-quantity"
                      type="text"
                      value={form.quantity}
                      onChange={(e) => update("quantity", e.target.value)}
                      className={fieldClass}
                      placeholder="Packages, pallets, or TEU"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fade-up">
                  <fieldset>
                    <legend className={labelClass}>Shipping method</legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {(["sea", "air", "road"] as const).map((m) => (
                        <label
                          key={m}
                          className={`flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-base font-medium capitalize transition-[background-color,color,border-color] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent-ink)] ${
                            form.method === m
                              ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-[var(--navy)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="method"
                            value={m}
                            checked={form.method === m}
                            onChange={() => update("method", m)}
                            className="sr-only"
                          />
                          {m}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="quote-requirements" className={labelClass}>
                      Requirements & timeline
                    </label>
                    <textarea
                      id="quote-requirements"
                      value={form.requirements}
                      onChange={(e) => update("requirements", e.target.value)}
                      className={`${fieldClass} min-h-[140px] resize-y`}
                      placeholder="Incoterms, target ETA, special handling, permits…"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fade-up">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="quote-name" className={labelClass}>
                        Full name *
                      </label>
                      <input
                        id="quote-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className={fieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-company" className={labelClass}>
                        Company
                      </label>
                      <input
                        id="quote-company"
                        type="text"
                        value={form.company}
                        onChange={(e) => update("company", e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-email" className={labelClass}>
                        Email *
                      </label>
                      <input
                        id="quote-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className={fieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-phone" className={labelClass}>
                        Phone *
                      </label>
                      <input
                        id="quote-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className={fieldClass}
                        required
                      />
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    Have documents to share? Send them by follow-up email or WhatsApp after you submit.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white py-3 pl-5 pr-6 text-base font-medium text-[var(--navy)] transition-[background-color,color,border-color,transform] duration-200 hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-0"
              >
                <ArrowLeft className="h-5 w-5" /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--navy)] py-3 pl-6 pr-5 text-base font-medium text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97]"
                >
                  Continue to {STEPS[step + 1].title}
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--navy)] py-3 pl-6 pr-5 text-base font-medium text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit quote request"}
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Side panel */}
        <aside className="space-y-6 lg:sticky lg:top-28">
          <div className="rounded-3xl bg-[var(--navy)] p-6 text-white sm:p-8">
            <h2 className="text-xl font-medium tracking-[-0.01em]">Have these ready</h2>
            <ol className="mt-5 space-y-5">
              {haveReady.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span className="text-base tabular-nums text-white/70">0{i + 1}</span>
                  <span>
                    <span className="block text-base font-medium">{item.title}</span>
                    <span className="block text-sm leading-6 text-white/75">{item.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">What happens next</h2>
            <ol className="mt-3">
              {nextSteps.map((item, i) => (
                <li key={item} className="grid grid-cols-[2.25rem_1fr] items-baseline gap-2 border-t border-slate-200 py-4 first:border-t-0">
                  <span className="text-base tabular-nums text-slate-400">0{i + 1}</span>
                  <span className="text-base leading-7 text-slate-600">{item}</span>
                </li>
              ))}
            </ol>

            <h2 className="mt-6 border-t border-slate-200 pt-6 text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">You will get</h2>
            <ul className="mt-4 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex gap-3 text-base leading-7 text-slate-600">
                  <Check className="mt-1.5 h-4 w-4 shrink-0 text-[var(--accent-ink)]" strokeWidth={2} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <a
              href={SITE_SETTINGS.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-medium text-[var(--navy)] transition-[background-color,color,border-color,transform] duration-200 hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white active:scale-[0.97]"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.6} />
              WhatsApp us instead
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}
