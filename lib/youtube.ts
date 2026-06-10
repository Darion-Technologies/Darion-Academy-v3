const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [type, id] = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(type)) videoId = id ?? null;
      }
    }

    return videoId && VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(value: string) {
  const videoId = getYouTubeVideoId(value);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export interface YouTubeShortSnippet {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number;
}

export async function fetchYouTubeShorts(keyword: string): Promise<YouTubeShortSnippet[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", keyword);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoDuration", "short");
  searchUrl.searchParams.set("videoEmbeddable", "true");
  searchUrl.searchParams.set("maxResults", "20");
  searchUrl.searchParams.set("key", apiKey);

  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok) {
    throw new Error(`YouTube API Error: ${searchRes.statusText}`);
  }
  
  const searchData = await searchRes.json();
  const videoIds = searchData.items?.map((item: any) => item.id.videoId) || [];
  
  if (videoIds.length === 0) {
    return [];
  }

  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailsUrl.searchParams.set("part", "snippet,contentDetails");
  detailsUrl.searchParams.set("id", videoIds.join(","));
  detailsUrl.searchParams.set("key", apiKey);

  const detailsRes = await fetch(detailsUrl.toString());
  if (!detailsRes.ok) {
    throw new Error(`YouTube API Error: ${detailsRes.statusText}`);
  }

  const detailsData = await detailsRes.json();

  const shorts: YouTubeShortSnippet[] = [];

  for (const item of detailsData.items) {
    const durationStr = item.contentDetails?.duration || "";
    const durationSeconds = parseYouTubeDuration(durationStr);

    if (durationSeconds <= 60) {
      shorts.push({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
        publishedAt: item.snippet.publishedAt,
        durationSeconds,
      });
    }
  }

  return shorts;
}
