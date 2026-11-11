import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "light" | "dark" | "cream" | "navy" | "muted";
}

/**
 * Page section. Light backgrounds sit directly on the grey page; `dark` and `navy`
 * render as an inset rounded navy panel, like the homepage services block.
 */
export function Section({ children, className, background = "white" }: SectionProps) {
  const isDark = background === "dark" || background === "navy";

  if (isDark) {
    return (
      <section className="px-3 py-6 sm:px-5">
        <div className={cn("mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] py-12 text-white sm:rounded-[2rem] sm:py-16 lg:py-20", className)}>{children}</div>
      </section>
    );
  }

  return <section className={cn("py-12 sm:py-16 lg:py-20", className)}>{children}</section>;
}
