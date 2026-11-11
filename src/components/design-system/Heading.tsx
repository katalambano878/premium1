import { cn } from "@/lib/utils";

interface HeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "xl" | "lg" | "md" | "sm";
  className?: string;
}

const sizeClasses = {
  xl: "text-3xl sm:text-[2.5rem] font-medium leading-[1.15] tracking-[-0.02em]",
  lg: "text-2xl sm:text-3xl font-medium leading-[1.2] tracking-[-0.02em]",
  md: "text-xl sm:text-2xl font-medium tracking-[-0.01em]",
  sm: "text-lg font-medium",
};

export function Heading({ children, as: Tag = "h2", size = "lg", className }: HeadingProps) {
  return <Tag className={cn(sizeClasses[size], className)}>{children}</Tag>;
}
