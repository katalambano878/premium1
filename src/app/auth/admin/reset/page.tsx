"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-[var(--navy)] placeholder:text-slate-400 focus:border-[var(--navy)] focus:outline-none";
const buttonClass =
  "inline-flex w-full items-center justify-center rounded-full bg-[var(--navy)] py-3.5 text-base font-medium text-white transition-colors hover:bg-[var(--accent)] hover:text-[var(--navy)] disabled:opacity-50";

function RequestLink() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <p className="mt-6 text-base leading-7 text-slate-600">
        If <strong className="font-medium text-[var(--navy)]">{email}</strong> belongs to an active staff account, a link to set your password is on its way. It expires in one hour.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <p className="text-sm leading-6 text-slate-500">Enter your staff email and we will send you a link to set a new password.</p>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--navy)]">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required autoComplete="email" />
      </div>
      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Sending…" : "Email me a link"}
      </button>
    </form>
  );
}

function SetPassword({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (password !== confirm) {
      setErr("The two passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setLoading(false);
    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setErr(data.error || "Could not set the password. Try again.");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="mt-6">
        <p className="text-base leading-7 text-slate-600">Your password is set.</p>
        <Link href="/auth/admin" className={`${buttonClass} mt-6`}>Sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--navy)]">New password</label>
        <input id="password" type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required autoComplete="new-password" />
        <p className="mt-1.5 text-sm text-slate-500">At least 10 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-[var(--navy)]">Repeat password</label>
        <input id="confirm" type="password" minLength={10} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} required autoComplete="new-password" />
      </div>
      {err ? <p className="text-sm text-red-600" role="alert">{err}</p> : null}
      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}

function ResetInner() {
  const token = useSearchParams().get("token");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] p-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
        <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--navy)]">{token ? "Set your password" : "Set or reset password"}</h1>
        {token ? <SetPassword token={token} /> : <RequestLink />}
        <Link href="/auth/admin" className="mt-6 block text-sm text-slate-500 hover:text-[var(--navy)]">Back to sign in</Link>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f4f5]" />}>
      <ResetInner />
    </Suspense>
  );
}
