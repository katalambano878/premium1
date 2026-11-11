// Upload rules shared by the inquiry and shipment document routes.
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const ALLOWED = new Map<string, string>([
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["webp", "image/webp"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
]);

export function checkUpload(file: File): { ok: true; ext: string; contentType: string } | { ok: false; error: string } {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Files must be 20 MB or smaller." };
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const contentType = ALLOWED.get(ext);
  if (!contentType) return { ok: false, error: "Upload a PDF, image, Word or Excel file." };
  return { ok: true, ext, contentType };
}

export const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-120);

/** Staff-only download URL for a stored object (served by /api/files). */
export const fileUrl = (bucket: string, objectPath: string) =>
  `/api/files/${bucket}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
