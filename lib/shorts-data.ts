import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getTrendingShorts = cache(async (limit: number = 4) => {
  return unstable_cache(async () => {
    return prisma.youTubeShort.findMany({
      where: { approved: true, rejected: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        channelName: true,
        thumbnailUrl: true,
        durationSeconds: true,
        category: true,
      },
    });
  }, [`trending-shorts-${limit}`], { tags: ["shorts"], revalidate: 3600 })();
});
