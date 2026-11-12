import { CircleDot, MessageSquare, PackagePlus, Truck, type LucideIcon } from "lucide-react";
import { EmptyState, formatDateTime, statusLabel, timeAgo } from "./ui";

export interface ShipmentEvent {
  id: string;
  event_type: string;
  message: string | null;
  created_at: string;
  /** Name of the staff member who posted it, when known. */
  author: string | null;
}

const EVENT: Record<string, { icon: LucideIcon; label: string }> = {
  status_change: { icon: Truck, label: "Status change" },
  created: { icon: PackagePlus, label: "Shipment created" },
  update: { icon: MessageSquare, label: "Update for the client" },
  note: { icon: MessageSquare, label: "Internal note" },
};

/** Status changes are stored as "Status changed to in transit"; show the proper status name. */
function eventText(ev: ShipmentEvent) {
  const m = ev.event_type === "status_change" ? /^Status changed to (.+)$/i.exec(ev.message || "") : null;
  if (m) return `Status changed to ${statusLabel(m[1].trim().replace(/ /g, "_"))}`;
  return ev.message || EVENT[ev.event_type]?.label || statusLabel(ev.event_type);
}

export function ShipmentTimeline({ events }: { events: ShipmentEvent[] }) {
  if (!events.length) {
    return (
      <EmptyState
        compact
        icon={MessageSquare}
        title="No updates yet"
        description="Status changes and the updates you post will be listed here, newest first."
      />
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((ev, i) => {
        const Icon = EVENT[ev.event_type]?.icon || CircleDot;
        const last = i === events.length - 1;
        return (
          <li key={ev.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                <Icon size={16} strokeWidth={1.7} aria-hidden />
              </span>
              {!last ? <span className="my-1 w-px flex-1 bg-slate-200" aria-hidden /> : null}
            </div>
            <div className={last ? "min-w-0 pt-1.5" : "min-w-0 pb-5 pt-1.5"}>
              <p className="whitespace-pre-wrap break-words text-[15px] leading-6 text-[var(--navy)]">{eventText(ev)}</p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {ev.author || "System"} · <time dateTime={ev.created_at} title={formatDateTime(ev.created_at)}>{timeAgo(ev.created_at)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
