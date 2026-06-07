import { TopRowSkeleton } from "./_components/top-row-skeleton";
import { BottomRowSkeleton } from "./_components/bottom-row-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1360px] space-y-3">
      <TopRowSkeleton />
      <BottomRowSkeleton />
    </div>
  );
}
