"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-[var(--navy)] placeholder:text-slate-400 transition-colors duration-200 focus:border-[var(--navy)] focus:outline-none";
const labelClass = "mb-2 block text-sm font-medium text-[var(--navy)]";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: trap || undefined }),
      });
      if (res.ok) {
        setStatus("ok");
        setForm({ name: "", email: "", phone: "", company: "", message: "" });
      } else setStatus("err");
    } catch {
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div role="status" className="flex flex-col items-start gap-5 sm:flex-row">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--accent-ink)]">
          <Check className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <div>
          <p className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">Message sent</p>
          <p className="mt-2 text-base leading-7 text-slate-600">
            We typically reply within {process.env.NEXT_PUBLIC_RESPONSE_SLA_HOURS || "24"} hours on business days.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-5 inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[var(--navy)] transition-[background-color,color,border-color,transform] duration-200 hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white active:scale-[0.97]"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-5">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute opacity-0 w-px h-px overflow-hidden"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name *
          </label>
          <input
            id="contact-name"
            autoComplete="name"
            className={fieldClass}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            className={fieldClass}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="contact-phone"
            autoComplete="tel"
            className={fieldClass}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="contact-company" className={labelClass}>
            Company
          </label>
          <input
            id="contact-company"
            autoComplete="organization"
            className={fieldClass}
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message *
        </label>
        <textarea
          id="contact-message"
          className={`${fieldClass} min-h-[140px] resize-y`}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          required
          minLength={10}
          placeholder="How can we help?"
        />
      </div>
      {status === "err" && (
        <p role="alert" className="text-sm text-red-600">
          Could not send. Email us directly or use WhatsApp.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--navy)] py-3 pl-6 pr-5 text-base font-medium text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send message"}
        <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
