"use client";

import { Ban, CheckCircle2, Send } from "lucide-react";
import { updateInvoiceStatus } from "@/app/admin/finance/actions";
import { ActionButton } from "./ui-client";

const CONFIG = {
  sent: { label: "Mark as sent", icon: Send, variant: "primary", confirm: undefined, success: "Invoice marked as sent" },
  paid: { label: "Mark as paid", icon: CheckCircle2, variant: "secondary", confirm: "Confirm: mark as paid", success: "Invoice marked as paid" },
  void: { label: "Void invoice", icon: Ban, variant: "danger", confirm: "Confirm: void invoice", success: "Invoice voided" },
} as const;

/** Moves an invoice to a new status. Marking as paid and voiding ask for a second click. */
export function InvoiceStatusButton({
  invoiceId,
  newStatus,
  variant,
}: {
  invoiceId: string;
  newStatus: keyof typeof CONFIG;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { label, icon: Icon, confirm, success, variant: defaultVariant } = CONFIG[newStatus];
  return (
    <ActionButton
      action={updateInvoiceStatus}
      fields={{ id: invoiceId, status: newStatus }}
      confirm={confirm}
      success={success}
      error="The invoice status could not be changed. Try again."
      variant={variant || defaultVariant}
      size="md"
    >
      <Icon size={16} aria-hidden /> {label}
    </ActionButton>
  );
}
