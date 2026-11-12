// Document types staff can file a shipment document under.
export const DOC_TYPES = [
  { value: "bill_of_lading", label: "Bill of lading" },
  { value: "commercial_invoice", label: "Commercial invoice" },
  { value: "packing_list", label: "Packing list" },
  { value: "certificate_of_origin", label: "Certificate of origin" },
  { value: "customs_declaration", label: "Customs declaration" },
  { value: "insurance_certificate", label: "Insurance certificate" },
  { value: "delivery_note", label: "Delivery note" },
  { value: "other", label: "Other" },
] as const;

export const docTypeLabel = (type: string | null | undefined) =>
  DOC_TYPES.find((t) => t.value === type)?.label ||
  (type ? type.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "Other");

/** The file's own name from its stored URL (drops the folder and the upload timestamp). */
export function fileNameFromUrl(url: string | null | undefined): string {
  const last = (url || "").split("?")[0].split("/").pop() || "";
  let name = last;
  try {
    name = decodeURIComponent(last);
  } catch {
    // keep the raw segment
  }
  return name.replace(/^\d{10,}-/, "") || "Document";
}
