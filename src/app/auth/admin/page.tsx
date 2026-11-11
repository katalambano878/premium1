"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-[var(--navy)] placeholder:text-slate-400 focus:border-[var(--navy)] focus:outline-none";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);
    setLoading(false);
    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setErr(data.error || "Sign-in failed. Check your connection and try again.");
      return;
    }
    router.push(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] p-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
        <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--navy)]">Staff sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Premium 1 Logistics operations dashboard</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--navy)]">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--navy)]">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required autoComplete="current-password" />
          </div>
          {err ? <p className="text-sm text-red-600" role="alert">{err}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--navy)] py-3.5 text-base font-medium text-white transition-colors hover:bg-[var(--accent)] hover:text-[var(--navy)] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading ? <ArrowUpRight className="h-4 w-4" /> : null}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/auth/admin/reset" className="font-medium text-[var(--navy)] underline-offset-4 hover:underline">
            Set or reset password
          </Link>
          <Link href="/" className="text-slate-500 hover:text-[var(--navy)]">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f4f5]" />}>
      <LoginForm />
    </Suspense>
  );
}
