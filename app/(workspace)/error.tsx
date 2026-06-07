"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        The requested dashboard data could not be loaded. This might be a temporary issue.
      </p>
      <Button variant="outline" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
