import { TopRowSkeleton } from "./dashboard/_components/top-row-skeleton";
import { BottomRowSkeleton } from "./dashboard/_components/bottom-row-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1360px] space-y-3">
      <TopRowSkeleton />
      <BottomRowSkeleton />
    </div>
  );
}
