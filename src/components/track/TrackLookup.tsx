"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Clock, Search, Truck } from "lucide-react";

interface TrackEvent {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
}

interface TrackResult {
  shipment_no: string;
  origin: string;
  destination: string;
  method: string;
  status: string;
  key_dates: Record<string, string>;
  events: TrackEvent[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  booked: "Booked",
  in_transit: "In Transit",
  arrived: "Arrived at Port",
  clearing: "Customs Clearing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  booked: "bg-blue-50 text-blue-700",
  in_transit: "bg-amber-50 text-amber-700",
  arrived: "bg-cyan-50 text-cyan-700",
  clearing: "bg-purple-50 text-purple-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-green-700",
};

export function TrackLookup() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Shipment not found.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Unable to reach tracking service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Lookup */}
      <form onSubmit={handleSearch} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <label htmlFor="track-ref" className="mb-2 block text-sm font-medium text-[var(--navy)]">
          Shipment or enquiry reference
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" strokeWidth={1.6} aria-hidden />
            <input
              id="track-ref"
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. SHP-20260415-1001"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "track-error" : undefined}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-base text-[var(--navy)] placeholder:text-slate-400 transition-colors duration-200 focus:border-[var(--navy)] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--navy)] py-3 pl-6 pr-5 text-base font-medium text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
          >
            {loading ? "Searching..." : "Track"}
            <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
        {error && (
          <p id="track-error" role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {/* Results */}
      {result && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <span className="inline-flex max-w-full rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600">
                <span className="truncate">{result.shipment_no}</span>
              </span>
              <h3 className="mt-4 break-words text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">
                {result.origin} → {result.destination}
              </h3>
              <p className="mt-1 text-sm capitalize leading-6 text-slate-500">{result.method} freight</p>
            </div>
            <span
              className={`inline-flex shrink-0 self-start rounded-full px-4 py-1.5 text-sm font-medium ${
                STATUS_COLORS[result.status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {STATUS_LABELS[result.status] || result.status}
            </span>
          </div>

          {/* Key dates */}
          {Object.keys(result.key_dates).length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              {Object.entries(result.key_dates).map(([k, v]) =>
                v ? (
                  <div key={k}>
                    <dt className="text-sm capitalize text-slate-500">{k}</dt>
                    <dd className="mt-0.5 text-base font-medium text-[var(--navy)]">{v}</dd>
                  </div>
                ) : null
              )}
            </dl>
          )}

          {/* Timeline */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h4 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">Tracking history</h4>
            {result.events.length > 0 ? (
              <ol className="mt-5">
                {result.events.map((ev, i) => {
                  const isFirst = i === 0;
                  const isLast = i === result.events.length - 1;
                  return (
                    <li key={ev.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                            isFirst ? "bg-[var(--accent)] text-[var(--navy)]" : "border border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {ev.event_type === "status_change" ? (
                            <Truck className="h-5 w-5" strokeWidth={1.6} />
                          ) : isFirst ? (
                            <Check className="h-5 w-5" strokeWidth={1.6} />
                          ) : (
                            <Clock className="h-5 w-5" strokeWidth={1.6} />
                          )}
                        </span>
                        {!isLast && <span className="my-1 w-px flex-1 bg-slate-200" aria-hidden />}
                      </div>
                      <div className={`min-w-0 pt-2 ${isLast ? "" : "pb-6"}`}>
                        <p className={`break-words text-base leading-7 ${isFirst ? "font-medium text-[var(--navy)]" : "text-slate-600"}`}>
                          {ev.message || ev.event_type.replace(/_/g, " ")}
                        </p>
                        <p className="mt-0.5 text-sm tabular-nums text-slate-500">{new Date(ev.created_at).toLocaleString()}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500">No tracking events recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
