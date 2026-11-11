import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface StepTimelineProps {
  steps: Step[];
  className?: string;
  /** light: rows on the grey page or a white card; dark: rows inside a navy panel */
  variant?: "light" | "dark";
}

/** Numbered rows: faint numeral, medium-weight title, small body, hairline between rows. */
export function StepTimeline({ steps, className, variant = "light" }: StepTimelineProps) {
  const isDark = variant === "dark";

  return (
    <ol className={cn("border-t", isDark ? "border-white/15" : "border-slate-200", className)}>
      {steps.map((step, i) => (
        <li
          key={i}
          className={cn(
            "grid grid-cols-[2.5rem_1fr] gap-x-4 border-b py-5 sm:grid-cols-[3.5rem_1fr] sm:py-6",
            isDark ? "border-white/15" : "border-slate-200",
          )}
        >
          <span className={cn("text-lg tabular-nums", isDark ? "text-white/70" : "text-slate-400")} aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h4 className={cn("text-lg font-medium sm:text-xl", isDark ? "text-white" : "text-[var(--navy)]")}>{step.title}</h4>
            <p className={cn("mt-1.5 max-w-xl text-sm leading-6", isDark ? "text-white/75" : "text-slate-500")}>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
