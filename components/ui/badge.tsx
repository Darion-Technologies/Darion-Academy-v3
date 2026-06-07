import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "error" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-transparent bg-[var(--success-light)] text-[var(--success)]",
  warning: "border-transparent bg-[var(--warning-light)] text-[var(--warning)]",
  error: "border-transparent bg-[var(--error-light)] text-[var(--error)]",
  info: "border-transparent bg-[var(--info-light)] text-[var(--info)]",
};

export function Badge({
  children,
  className,
  variant = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", variantStyles[variant], className)}>
      {children}
    </span>
  );
}
