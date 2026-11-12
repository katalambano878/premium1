"use client";

// Interactive pieces of the admin UI kit: forms that report success or
// failure, submit buttons that show progress, confirm steps and a dialog.
import { createContext, useContext, useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { buttonClass, cx } from "./ui";

type Action = (formData: FormData) => Promise<unknown>;

const PendingContext = createContext(false);

const isRedirect = (e: unknown) => String((e as { digest?: string })?.digest || "").startsWith("NEXT_REDIRECT");

/** What to tell staff when a save fails. Production hides server error text, so fall back to a plain line. */
function failureMessage(e: unknown, fallback: string) {
  const msg = e instanceof Error ? e.message : "";
  if (!msg || /Server Components render|digest|unexpected response/i.test(msg)) return fallback;
  return msg;
}

/**
 * Runs a server action and reports the result as a toast.
 * Returns [run, pending].
 */
export function useAction(
  action: Action,
  opts: { success?: string; error?: string; onDone?: () => void; refresh?: boolean } = {},
) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const run = (formData: FormData) =>
    startTransition(async () => {
      try {
        await action(formData);
        if (opts.success) toast.success(opts.success);
        if (opts.refresh !== false) router.refresh();
        opts.onDone?.();
      } catch (e) {
        if (isRedirect(e)) throw e;
        toast.error(failureMessage(e, opts.error || "That could not be saved. Check the details and try again."));
      }
    });
  return [run, pending] as const;
}

/**
 * A form wired to a server action: shows a toast on success or failure,
 * disables its submit button while saving, and can reset itself afterwards.
 */
export function ActionForm({
  action,
  success,
  error,
  resetOnSuccess,
  className,
  children,
  hidden,
}: {
  action: Action;
  success?: string;
  error?: string;
  resetOnSuccess?: boolean;
  className?: string;
  children: React.ReactNode | ((pending: boolean) => React.ReactNode);
  /** Extra hidden values sent with the form. */
  hidden?: Record<string, string>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [run, pending] = useAction(action, {
    success,
    error,
    onDone: () => {
      if (resetOnSuccess) ref.current?.reset();
    },
  });
  return (
    <form
      ref={ref}
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        run(new FormData(e.currentTarget));
      }}
    >
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <PendingContext.Provider value={pending}>{typeof children === "function" ? children(pending) : children}</PendingContext.Provider>
    </form>
  );
}

/** Submit button for ActionForm: shows a spinner and blocks double clicks while saving. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}) {
  const pending = useContext(PendingContext);
  return (
    <button type="submit" disabled={pending || disabled} className={buttonClass(variant, size, className)}>
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/**
 * A one-click action (no visible fields), with an optional confirm step for
 * anything that is hard to undo: the first click asks, the second one does it.
 */
export function ActionButton({
  action,
  fields,
  children,
  success,
  error,
  confirm,
  variant = "secondary",
  size = "sm",
  className,
  title,
}: {
  action: Action;
  fields: Record<string, string>;
  children: React.ReactNode;
  success?: string;
  error?: string;
  /** Text shown on the button while it waits for the second click. */
  confirm?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  title?: string;
}) {
  const [run, pending] = useAction(action, { success, error });
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(t);
  }, [asking]);

  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      className={buttonClass(asking ? "danger" : variant, size, className)}
      onClick={() => {
        if (confirm && !asking) {
          setAsking(true);
          return;
        }
        setAsking(false);
        const fd = new FormData();
        for (const [k, v] of Object.entries(fields)) fd.set(k, v);
        run(fd);
      }}
    >
      {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
      {asking ? confirm : children}
    </button>
  );
}

/** A select that saves as soon as its value changes (status, assignee, role). */
export function AutoSelect({
  action,
  name,
  value,
  fields,
  options,
  success,
  ariaLabel,
  className,
  disabled,
}: {
  action: Action;
  name: string;
  value: string;
  fields: Record<string, string>;
  options: { value: string; label: string }[];
  success?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  // While saving, show the choice just made; afterwards the saved value (so a failed save snaps back).
  const [choice, setChoice] = useState<string | null>(null);
  const [run, pending] = useAction(action, { success });
  const current = pending && choice !== null ? choice : value;
  return (
    <select
      aria-label={ariaLabel}
      value={current}
      disabled={pending || disabled}
      onChange={(e) => {
        setChoice(e.target.value);
        const fd = new FormData();
        for (const [k, v] of Object.entries(fields)) fd.set(k, v);
        fd.set(name, e.target.value);
        run(fd);
      }}
      className={cx(
        "min-h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-[13px] font-medium text-[var(--navy)] transition-colors hover:border-slate-400 focus:border-[var(--navy)] focus:outline-none disabled:opacity-60",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Centered dialog. Closes on Escape and on a click outside; returns focus to where it came from. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        "m-auto w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-0 text-left shadow-[0_32px_64px_-24px_rgba(11,31,58,0.45)] backdrop:bg-[rgba(8,20,40,0.5)] open:animate-[dialog-in_180ms_cubic-bezier(0.22,1,0.36,1)]",
        wide ? "max-w-2xl" : "max-w-lg",
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="text-lg font-medium text-[var(--navy)]">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--navy)]"
        >
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
    </dialog>
  );
}
