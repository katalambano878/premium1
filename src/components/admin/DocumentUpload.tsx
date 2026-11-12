"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, FileText, Loader2, Ship, Upload, X } from "lucide-react";
import { MAX_UPLOAD_BYTES, checkUpload } from "@/lib/uploads";
import { Dialog } from "./ui-client";
import { ButtonLink, Callout, Field, Select, buttonClass, cx } from "./ui";
import { DOC_TYPES } from "./documents/doc-types";

type Item = {
  id: string;
  file: File;
  state: "ready" | "uploading" | "done" | "error";
  error?: string;
  /** Rejected before upload (wrong type or too large); retrying will not help. */
  invalid?: boolean;
};

const MAX_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx";

const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

async function uploadOne(file: File, shipmentId: string, docType: string): Promise<string | null> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("shipment_id", shipmentId);
  fd.set("doc_type", docType);
  try {
    const res = await fetch("/api/upload/document", { method: "POST", body: fd });
    if (res.ok) return null;
    if (res.status === 401) return "You have been signed out. Sign in again, then retry.";
    if (res.status === 413) return `The file is too large. The limit is ${MAX_MB} MB.`;
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return data?.error || "The upload failed. Try again.";
  } catch {
    return "Could not reach the server. Check your connection and retry.";
  }
}

/**
 * "Upload documents" button plus the dialog it opens. Pass `shipmentId` to
 * file everything under one shipment (used on the shipment page).
 */
export function DocumentUpload({
  shipments,
  shipmentId: fixedShipmentId,
  variant = "primary",
  size = "md",
  label = "Upload documents",
}: {
  shipments: { id: string; shipment_no: string }[];
  shipmentId?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [shipmentId, setShipmentId] = useState(fixedShipmentId || "");
  const [docType, setDocType] = useState<string>("other");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ at: 0, of: 0 });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const router = useRouter();

  const pending = items.filter((i) => i.state === "ready" || (i.state === "error" && !i.invalid));
  const fixedShipment = fixedShipmentId ? shipments.find((s) => s.id === fixedShipmentId) : undefined;

  const addFiles = (incoming: FileList | File[]) => {
    const added: Item[] = Array.from(incoming).map((file) => {
      const check = checkUpload(file);
      return check.ok
        ? { id: crypto.randomUUID(), file, state: "ready" }
        : { id: crypto.randomUUID(), file, state: "error", error: check.error, invalid: true };
    });
    setItems((prev) => {
      const seen = new Set(prev.map((i) => `${i.file.name}:${i.file.size}`));
      return [...prev, ...added.filter((a) => !seen.has(`${a.file.name}:${a.file.size}`))];
    });
  };

  const patch = (id: string, change: Partial<Item>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...change } : i)));

  const close = () => {
    setOpen(false);
    if (!uploading) setItems([]);
  };

  const upload = async () => {
    if (!shipmentId) {
      toast.error("Choose the shipment these documents belong to.");
      return;
    }
    if (pending.length === 0) return;

    setUploading(true);
    let ok = 0;
    let failed = 0;
    for (const [n, item] of pending.entries()) {
      setProgress({ at: n + 1, of: pending.length });
      patch(item.id, { state: "uploading", error: undefined });
      const error = await uploadOne(item.file, shipmentId, docType);
      if (error) {
        failed++;
        patch(item.id, { state: "error", error });
      } else {
        ok++;
        patch(item.id, { state: "done" });
      }
    }
    setUploading(false);

    if (ok > 0) {
      toast.success(ok === 1 ? "1 document uploaded" : `${ok} documents uploaded`);
      router.refresh();
    }
    if (failed > 0) {
      toast.error(failed === 1 ? "1 file could not be uploaded. See the list for the reason." : `${failed} files could not be uploaded. See the list for the reasons.`);
    } else if (!items.some((i) => i.invalid)) {
      setOpen(false);
      setItems([]);
    }
  };

  return (
    <>
      <button type="button" className={buttonClass(variant, size)} onClick={() => setOpen(true)}>
        <Upload size={size === "sm" ? 15 : 16} aria-hidden /> {label}
      </button>

      <Dialog
        open={open}
        onClose={close}
        title="Upload documents"
        description={
          fixedShipment
            ? `Files are added to shipment ${fixedShipment.shipment_no}.`
            : "File bills of lading, invoices, packing lists and other paperwork under the shipment they belong to."
        }
        wide
      >
        {shipments.length === 0 ? (
          <Callout
            tone="warning"
            icon={Ship}
            title="Create a shipment first"
            action={<ButtonLink href="/admin/shipments/new">New shipment</ButtonLink>}
          >
            Documents are filed under a shipment, and there are none yet.
          </Callout>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {fixedShipment ? null : (
                <Field label="Shipment" htmlFor={`${uid}-shipment`} required>
                  <Select id={`${uid}-shipment`} value={shipmentId} disabled={uploading} onChange={(e) => setShipmentId(e.target.value)}>
                    <option value="" disabled>
                      Choose a shipment
                    </option>
                    {shipments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shipment_no}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field
                label="Document type"
                htmlFor={`${uid}-type`}
                hint="Applies to every file in this upload."
                className={fixedShipment ? "sm:col-span-2" : undefined}
              >
                <Select id={`${uid}-type`} value={docType} disabled={uploading} onChange={(e) => setDocType(e.target.value)}>
                  {DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (!uploading && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
                }}
                className={cx(
                  "flex w-full flex-col items-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ink)] disabled:opacity-60",
                  dragOver ? "border-[var(--navy)] bg-slate-100" : "border-slate-300 bg-slate-50 hover:border-slate-400",
                )}
              >
                <Upload size={22} strokeWidth={1.6} className="text-slate-500" aria-hidden />
                <span className="mt-3 text-sm font-medium text-[var(--navy)]">Drop files here, or click to choose</span>
                <span className="mt-1 text-[13px] leading-5 text-slate-500">
                  PDF, PNG, JPG, WebP, Word or Excel. Up to {MAX_MB} MB per file.
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                accept={ACCEPT}
                aria-label="Choose files to upload"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {items.length > 0 ? (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200" aria-live="polite">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 px-3.5 py-3">
                    <span className="mt-0.5 shrink-0">
                      {item.state === "uploading" ? (
                        <Loader2 size={18} className="animate-spin text-slate-500" aria-label="Uploading" />
                      ) : item.state === "done" ? (
                        <CheckCircle2 size={18} className="text-emerald-600" aria-label="Uploaded" />
                      ) : item.state === "error" ? (
                        <AlertCircle size={18} className="text-red-600" aria-label="Failed" />
                      ) : (
                        <FileText size={18} className="text-slate-400" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--navy)]">{item.file.name}</p>
                      <p className={cx("text-[13px] leading-5", item.state === "error" ? "text-red-700" : "text-slate-500")}>
                        {item.state === "error"
                          ? item.error
                          : item.state === "done"
                            ? "Uploaded"
                            : item.state === "uploading"
                              ? "Uploading…"
                              : fileSize(item.file.size)}
                      </p>
                    </div>
                    {item.state === "uploading" || item.state === "done" ? null : (
                      <button
                        type="button"
                        disabled={uploading}
                        aria-label={`Remove ${item.file.name}`}
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--navy)] disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button type="button" className={buttonClass("secondary", "md")} onClick={close}>
                {uploading ? "Hide" : "Cancel"}
              </button>
              <button
                type="button"
                className={buttonClass("primary", "md")}
                disabled={uploading || pending.length === 0 || !shipmentId}
                onClick={upload}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden /> Uploading {progress.at} of {progress.of}…
                  </>
                ) : pending.length === 0 ? (
                  "Upload"
                ) : (
                  `Upload ${pending.length} ${pending.length === 1 ? "file" : "files"}`
                )}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
