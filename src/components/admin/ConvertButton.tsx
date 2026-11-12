"use client";

import { useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { Dialog, useAction } from "./ui-client";
import { buttonClass } from "./ui";

/**
 * "Convert to shipment" with a confirm step, because it creates a shipment
 * (and sometimes a client) and marks the enquiry as won.
 */
export function ConvertButton({
  action,
  entityId,
  inquiryNo,
  contactName,
}: {
  action: (formData: FormData) => Promise<void>;
  entityId: string;
  inquiryNo?: string;
  contactName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [run, pending] = useAction(action, {
    error: "The shipment could not be created. Please try again.",
    onDone: () => setOpen(false),
  });

  const convert = () => {
    if (pending) return;
    const fd = new FormData();
    fd.set("id", entityId);
    run(fd);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary", "md")}>
        <Truck size={16} aria-hidden /> Convert to shipment
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Convert to a shipment?"
        description={inquiryNo ? `Enquiry ${inquiryNo}${contactName ? ` from ${contactName}` : ""}` : undefined}
      >
        <p className="text-sm leading-6 text-slate-600">Do this once the client has accepted the quote. It will:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
          <li>Create a draft shipment with this route, method and cargo.</li>
          <li>Link it to the client with the same email address, or add them as a new client.</li>
          <li>Mark this enquiry as won.</li>
        </ul>
        <p className="mt-3 text-sm leading-6 text-slate-500">You will be taken to the new shipment to finish the details.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setOpen(false)} disabled={pending} className={buttonClass("secondary", "md")}>
            Cancel
          </button>
          <button type="button" onClick={convert} disabled={pending} className={buttonClass("primary", "md")}>
            {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
            {pending ? "Creating shipment…" : "Create shipment"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
