"use client";

import { useState, useSyncExternalStore } from "react";
import { CTAButton } from "@/components/design-system/CTAButton";

const subscribeNoop = () => () => {};

function readStoredInquiry() {
  try {
    return `${sessionStorage.getItem("lastInquiryId") ?? ""}|${sessionStorage.getItem("lastInquiryDemo") ?? ""}`;
  } catch {
    return "|";
  }
}

export function ThanksClient({ inquiryNo }: { inquiryNo: string }) {
  const [status, setStatus] = useState<string>("");
  // Read the last enquiry from sessionStorage on the client only (empty on the server).
  const stored = useSyncExternalStore(subscribeNoop, readStoredInquiry, () => "|");
  const [storedId, storedDemo] = stored.split("|");
  const inquiryId = storedId && storedId !== "demo" ? storedId : null;
  const demo = storedDemo === "1" || storedId === "demo";

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !inquiryId) return;
    setStatus("Uploading…");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("inquiry_id", inquiryId);
    const res = await fetch("/api/upload/inquiry", { method: "POST", body: fd });
    if (res.ok) setStatus("Uploaded successfully. Our team will add it to your enquiry.");
    else setStatus("Upload failed—email documents to " + (process.env.NEXT_PUBLIC_SITE_EMAIL || "info@premium1logistics.com"));
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
      <p className="text-sm text-slate-500">Your reference</p>
      <p className="mt-1 break-all text-3xl font-medium tracking-[-0.02em] text-[var(--navy)]">{inquiryNo}</p>
      <p className="mt-6 text-base leading-7 text-slate-600">
        We have received your enquiry. A specialist will respond within <strong className="font-medium text-[var(--navy)]">24 hours</strong> with a written
        quote or follow-up questions.
      </p>
      {demo && (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-[var(--navy)]">
          To add documents, reply to the confirmation email we sent you.
        </p>
      )}
      {inquiryId && !demo && (
        <div className="mt-8 border-t border-slate-200 pt-8">
          <p className="mb-2 text-lg font-medium text-[var(--navy)]">Upload documents (optional)</p>
          <p className="text-sm text-slate-500 mb-4">Invoice draft, packing list, or supplier specs—PDF or images up to 20MB.</p>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-[var(--navy)] transition-colors hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white">
            Choose file
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={upload} />
          </label>
          {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <CTAButton href="/" variant="secondary">Back to home</CTAButton>
        <CTAButton href="/contact" variant="outline">
          Contact us
        </CTAButton>
      </div>
    </div>
  );
}
