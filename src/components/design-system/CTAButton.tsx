import Link from "next/link";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

/** Pill buttons. `primary` reads on light and dark panels; `secondary` is for light backgrounds, `light` for dark ones. */
const variants = {
  primary: "bg-[var(--accent)] text-[var(--navy)] hover:bg-[var(--accent-hover)] hover:text-white",
  secondary: "bg-[var(--navy)] text-white hover:bg-[var(--accent)] hover:text-[var(--navy)]",
  outline: "border border-slate-300 bg-white text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white",
  ghost: "text-[var(--navy)] hover:bg-slate-100",
  light: "border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-[var(--navy)]",
};

const sizes = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-7 py-3.5 text-base",
};

export function CTAButton({ children, href, variant = "primary", size = "md", className, external, onClick }: CTAButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.97]",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={base} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={base} onClick={onClick}>
      {children}
    </button>
  );
}
