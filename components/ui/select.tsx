import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-6 w-full rounded-none border border-input bg-card px-2 py-0.5 text-xs text-foreground shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:bg-muted disabled:text-muted-foreground", className)} {...props}>{children}</select>;
}
