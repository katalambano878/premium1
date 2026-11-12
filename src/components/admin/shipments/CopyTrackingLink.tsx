"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { buttonClass } from "../ui";

/** Copies the public tracking link for a shipment so it can be pasted into a message to the client. */
export function CopyTrackingLink({ shipmentNo }: { shipmentNo: string }) {
  const url = `https://premium1logistics.com/track?ref=${encodeURIComponent(shipmentNo)}`;
  return (
    <button
      type="button"
      className={buttonClass("secondary", "sm")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Tracking link copied");
        } catch {
          toast.error(`Could not copy. The link is ${url}`);
        }
      }}
    >
      <Link2 size={15} aria-hidden /> Copy tracking link
    </button>
  );
}
