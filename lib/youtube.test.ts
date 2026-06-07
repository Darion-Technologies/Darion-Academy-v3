import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl, getYouTubeVideoId } from "./youtube";

describe("YouTube URL parsing", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=10", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("extracts an ID from %s", (url, expected) => {
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("rejects non-YouTube and malformed URLs", () => {
    expect(getYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(getYouTubeVideoId("https://youtube.com/watch?v=short")).toBeNull();
  });

  it("uses YouTube's privacy-enhanced embed host", () => {
    expect(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ"))
      .toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
});
