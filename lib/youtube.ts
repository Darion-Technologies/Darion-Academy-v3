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
