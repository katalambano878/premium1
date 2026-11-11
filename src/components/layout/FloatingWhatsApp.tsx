"use client";

import { SITE_SETTINGS } from "@/lib/mock";

export function FloatingWhatsApp() {
  return (
    <a
      href={SITE_SETTINGS.social.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-50 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-[var(--navy)] text-white shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97] sm:bottom-6 sm:right-6 sm:w-auto sm:py-3 sm:pl-4 sm:pr-5"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M19.11 17.29c-.28-.14-1.64-.81-1.9-.9-.25-.09-.43-.14-.62.14-.19.28-.71.9-.87 1.09-.16.19-.32.21-.6.07-.28-.14-1.16-.43-2.2-1.37-.81-.72-1.35-1.61-1.51-1.89-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.47h-.53c-.19 0-.49.07-.74.35-.25.28-.97.95-.97 2.32s1 2.69 1.14 2.88c.14.19 1.94 2.96 4.71 4.15.66.29 1.18.46 1.58.59.66.21 1.26.18 1.73.11.53-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
        <path d="M16.01 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.25.59 4.46 1.7 6.4L3.2 28.8l6.56-1.68c1.87 1.02 3.98 1.56 6.25 1.56h.01c7.06 0 12.8-5.74 12.8-12.8S23.08 3.2 16.01 3.2zm0 23.33h-.01c-1.91 0-3.79-.51-5.44-1.48l-.39-.23-3.89.99 1.04-3.79-.25-.39a10.57 10.57 0 0 1-1.64-5.65c0-5.84 4.75-10.59 10.59-10.59 2.83 0 5.5 1.1 7.5 3.1 2 2 3.1 4.66 3.1 7.49 0 5.84-4.75 10.59-10.6 10.59z" />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}
