/**
 * The "Marvelous Adblocker" core logic.
 * Currently disabled. All public proxy APIs (Invidious/Piped) have been blocked by YouTube.
 * We now rely entirely on the native WebView ad-skipping script in CoursePlayerScreen.
 */
export async function fetchYouTubeStream(videoId: string): Promise<string | null> {
  // Returns null immediately to trigger the WebView fallback instantly
  return null;
}
