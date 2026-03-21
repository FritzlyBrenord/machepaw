import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium tracking-wide";

  const variants = {
    default: "bg-neutral-100 text-neutral-900",
    primary: "bg-neutral-900 text-white",
    secondary: "bg-neutral-200 text-neutral-700",
    outline: "bg-transparent border border-neutral-300 text-neutral-700",
    destructive: "bg-red-500 text-white",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
