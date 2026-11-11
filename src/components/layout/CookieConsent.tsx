"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "p1l_cookie_consent";

const subscribe = () => () => {};

/** True when no consent is stored (or storage is unavailable). */
const needsConsent = () => {
  try {
    return !localStorage.getItem(KEY);
  } catch {
    return true;
  }
};

/** Never render the banner on the server or during hydration. */
const needsConsentOnServer = () => false;

const linkClass =
  "font-medium text-[var(--navy)] underline decoration-[var(--navy)]/40 underline-offset-4 transition-colors hover:decoration-[var(--navy)]";

export function CookieConsent() {
  const pending = useSyncExternalStore(subscribe, needsConsent, needsConsentOnServer);
  const [accepted, setAccepted] = useState(false);
  const visible = pending && !accepted;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* */
    }
    setAccepted(true);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">
      <div
        role="region"
        aria-label="Cookie notice"
        className="pointer-events-auto w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)] sm:max-w-sm sm:p-6"
      >
        <p className="text-sm leading-6 text-slate-600">
          We use essential cookies to run this site and optional analytics to improve it. See our{" "}
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className={linkClass}>
            Cookie
          </Link>{" "}
          policies.
        </p>
        <button
          type="button"
          onClick={accept}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-full bg-[var(--navy)] px-6 py-2.5 text-sm font-medium text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97] sm:w-auto"
        >
          Accept essential
        </button>
      </div>
    </div>
  );
}
