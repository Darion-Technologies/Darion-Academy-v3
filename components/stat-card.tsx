import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail?: string; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between pt-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        </div>
        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
