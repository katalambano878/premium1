import { Check } from "lucide-react";
import { cx, statusLabel } from "../ui";
import { SHIPMENT_STAGES } from "./format";

/** The seven stages of a shipment: a row on wide screens, a list on phones. */
export function ShipmentProgress({ status }: { status: string }) {
  const current = SHIPMENT_STAGES.findIndex((s) => s === status);
  const finished = current === SHIPMENT_STAGES.length - 1;

  return (
    <ol aria-label="Shipment progress" className="flex flex-col gap-2.5 sm:flex-row sm:gap-0">
      {SHIPMENT_STAGES.map((stage, i) => {
        const done = i < current || (finished && i === current);
        const isCurrent = i === current && !finished;
        const line = "hidden h-0.5 flex-1 sm:block";
        return (
          <li
            key={stage}
            aria-current={i === current ? "step" : undefined}
            className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2"
          >
            <div className="flex items-center sm:w-full">
              <span className={cx(line, i === 0 ? "invisible" : i <= current ? "bg-[var(--navy)]" : "bg-slate-200")} aria-hidden />
              <span
                className={cx(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium tabular-nums",
                  done && "border-[var(--navy)] bg-[var(--navy)] text-white",
                  isCurrent && "border-[var(--navy)] bg-white text-[var(--navy)]",
                  !done && !isCurrent && "border-slate-200 bg-white text-slate-400",
                )}
                aria-hidden
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={cx(line, i === SHIPMENT_STAGES.length - 1 ? "invisible" : i < current ? "bg-[var(--navy)]" : "bg-slate-200")}
                aria-hidden
              />
            </div>
            <span
              className={cx(
                "text-[13px] leading-5 sm:px-1 sm:text-center",
                isCurrent ? "font-medium text-[var(--navy)]" : done ? "text-slate-600" : "text-slate-500",
              )}
            >
              {statusLabel(stage)}
              <span className="sr-only">{done ? " (done)" : isCurrent ? " (current stage)" : " (not started)"}</span>
              {isCurrent ? <span className="ml-2 text-slate-500 sm:hidden">Current stage</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
