"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Shown when a dashboard page or a save fails. Server actions throw on bad
// input, missing permission or a database error instead of failing silently.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  // In production Next.js replaces server error text with a generic message;
  // show ours when it came through, otherwise a plain explanation.
  const generic = !error.message || /Server Components render|digest/i.test(error.message);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle size={22} />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-slate-900">That did not go through</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {generic
          ? "The action could not be completed. This usually means a required field was missing, your role does not allow this change, or the connection dropped. Nothing else was changed."
          : error.message}
      </p>
      {error.digest ? <p className="mt-3 text-xs text-slate-400">Reference: {error.digest}</p> : null}
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <RotateCcw size={16} /> Try again
        </button>
        <Link href="/admin" className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
