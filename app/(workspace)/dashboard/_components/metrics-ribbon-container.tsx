import { getTopDashboardData } from "@/lib/dashboard-data";
import { MetricsRibbon } from "@/components/dashboard/metrics-ribbon";

export async function MetricsRibbonContainer({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);
  return <MetricsRibbon stats={data.stats} />;
}
