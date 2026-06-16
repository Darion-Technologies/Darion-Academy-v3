import { requireUser } from "@/lib/auth";
import { getWatchHistoryAction, getCommentHistoryAction } from "@/actions/history";
import { HistoryClient, UnifiedHistoryItem } from "./history-client";

export const metadata = {
  title: "History - Darion Academy",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const [watchHistory, commentHistory] = await Promise.all([
    getWatchHistoryAction(user.id),
    getCommentHistoryAction(user.id)
  ]);

  const unifiedHistory: UnifiedHistoryItem[] = [
    ...watchHistory.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      timestamp: item.watchedAt,
      completed: item.completed,
    })),
    ...commentHistory.map(item => ({
      id: item.id,
      type: item.type as "COMMENT",
      title: item.reference.title,
      text: item.text,
      url: item.reference.url,
      thumbnailUrl: item.reference.thumbnailUrl,
      timestamp: item.createdAt,
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return <HistoryClient initialData={unifiedHistory} />;
}
