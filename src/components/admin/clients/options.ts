// Client choices shared by the list, the detail page and the form.

export const PAYMENT_TERMS: { value: string; label: string; hint: string }[] = [
  { value: "prepaid", label: "Prepaid", hint: "Pays before the shipment moves" },
  { value: "net_15", label: "Net 15", hint: "Pays within 15 days of the invoice" },
  { value: "net_30", label: "Net 30", hint: "Pays within 30 days of the invoice" },
  { value: "net_60", label: "Net 60", hint: "Pays within 60 days of the invoice" },
];

export const paymentTermsLabel = (value: string | null | undefined) =>
  PAYMENT_TERMS.find((t) => t.value === value)?.label || "Net 30";

export const CLIENT_TIERS: { value: string; label: string; hint: string }[] = [
  { value: "new", label: "New", hint: "Just signed up, no track record yet." },
  { value: "standard", label: "Standard", hint: "Regular customer on normal terms." },
  { value: "vip", label: "VIP", hint: "Key account that gets priority handling." },
];

/** Digits for a wa.me link. Local Ghana numbers (0XX XXX XXXX) get the 233 country code. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("0")) digits = `233${digits.slice(1)}`;
  return digits.length >= 9 ? digits : null;
}
