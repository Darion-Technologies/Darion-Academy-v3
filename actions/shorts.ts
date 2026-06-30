"use server";

import { prisma } from "@/lib/prisma";
import { fetchYouTubeShorts, YouTubeShortSnippet } from "@/lib/youtube";
import { revalidatePath, revalidateTag } from "next/cache";

export async function searchShortsAction(keyword: string): Promise<YouTubeShortSnippet[]> {
  try {
    const shorts = await fetchYouTubeShorts(keyword);
    if (shorts.length === 0) return [];

    // Filter out videos already in the database (approved or rejected)
    const videoIds = shorts.map((s) => s.videoId);
    const existingShorts = await prisma.youTubeShort.findMany({
      where: { youtubeVideoId: { in: videoIds } },
      select: { youtubeVideoId: true },
    });

    const existingIds = new Set(existingShorts.map((s) => s.youtubeVideoId));
    return shorts.filter((s) => !existingIds.has(s.videoId));
  } catch (error: any) {
    console.error("Error searching shorts:", error);
    throw new Error(error.message || "Failed to search shorts");
  }
}

export async function getAutoFeedSuggestionsAction(): Promise<{keyword: string, shorts: YouTubeShortSnippet[]}> {
  try {
    const ROTATING_KEYWORDS = [
      "React.js tips", 
      "Python tricks", 
      "Linux commands", 
      "Git hacks", 
      "System Design shorts", 
      "TypeScript tricks", 
      "CSS animations shorts", 
      "Docker tips",
      "JavaScript secrets"
    ];
    
    // Pick a keyword based on the day of the year so it rotates daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const keyword = ROTATING_KEYWORDS[dayOfYear % ROTATING_KEYWORDS.length];
    
    const shorts = await searchShortsAction(keyword);
    return { keyword, shorts };
  } catch (error) {
    console.error("Error auto-fetching suggestions:", error);
    return { keyword: "Tech Tips", shorts: [] };
  }
}

export async function approveShortAction(
  video: YouTubeShortSnippet,
  category: string,
  tags: string[],
  score: number,
  adminId: string
) {
  try {
    await prisma.youTubeShort.create({
      data: {
        youtubeVideoId: video.videoId,
        title: video.title,
        description: video.description,
        channelName: video.channelTitle,
        channelId: video.channelId,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
        sourceUrl: `https://youtube.com/shorts/${video.videoId}`,
        category,
        tags,
        shortScore: score,
        approved: true,
        rejected: false,
        createdById: adminId,
      },
    });
    revalidatePath("/admin/shorts");
    revalidatePath("/dashboard/shorts");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving short:", error);
    throw new Error(error.message || "Failed to approve short");
  }
}

export async function rejectShortAction(video: YouTubeShortSnippet, adminId: string) {
  try {
    await prisma.youTubeShort.create({
      data: {
        youtubeVideoId: video.videoId,
        title: video.title,
        description: video.description,
        channelName: video.channelTitle,
        channelId: video.channelId,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
        sourceUrl: `https://youtube.com/shorts/${video.videoId}`,
        category: "Rejected", // default
        tags: [],
        approved: false,
        rejected: true,
        createdById: adminId,
      },
    });
    revalidatePath("/admin/shorts");
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting short:", error);
    throw new Error(error.message || "Failed to reject short");
  }
}

export async function getApprovedShortsAction(category?: string) {
  try {
    const whereClause: any = { approved: true };
    if (category && category !== "All") {
      whereClause.category = category;
    }
    
    const shorts = await prisma.youTubeShort.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return shorts;
  } catch (error: any) {
    console.error("Error getting approved shorts:", error);
    throw new Error("Failed to get approved shorts");
  }
}

export async function getShortByIdAction(id: string) {
  try {
    const short = await prisma.youTubeShort.findUnique({
      where: { id },
      include: {
        quizzes: true,
      },
    });
    return short;
  } catch (error: any) {
    console.error("Error getting short by id:", error);
    throw new Error("Failed to get short");
  }
}

import { YoutubeTranscript } from 'youtube-transcript';
import OpenAI from 'openai';

export async function fetchAutoTranscriptAction(shortId: string, videoId: string) {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    const rawText = transcriptArray.map(t => t.text).join(' ');

    if (!process.env.DEEPSEEK_API_KEY) {
      // Fallback if no API key
      await prisma.youTubeShort.update({ where: { id: shortId }, data: { transcript: rawText }});
      return { success: true, text: rawText };
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    let formattedText = rawText;
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are an expert technical writer. Format this raw video transcript into a highly readable, structured Markdown study guide. Fix grammar, add headings, and organize with paragraphs. CRITICAL: Whenever programming code or syntax is discussed or implied, you MUST reconstruct the code and wrap it in proper fenced Markdown code blocks (e.g., ```javascript). Do not output any preamble, just return the final markdown content." 
          },
          { role: "user", content: rawText }
        ],
        model: "deepseek-chat",
      });
      formattedText = completion.choices[0].message.content || rawText;
    } catch (aiError: any) {
      console.warn("AI formatting failed (e.g., insufficient balance), falling back to raw transcript.", aiError.message);
      // Fall back to rawText, no need to throw
    }

    // Save to database so it's only processed once
    await prisma.youTubeShort.update({
      where: { id: shortId },
      data: { transcript: formattedText }
    });

    return { success: true, text: formattedText };
  } catch (error: any) {
    console.error("Error fetching auto transcript:", error);
    return { success: false, error: "Transcript is disabled or unavailable for this video." };
  }
}

export async function updateShortDetailsAction(id: string, data: { description?: string; transcript?: string }) {
  try {
    const short = await prisma.youTubeShort.update({
      where: { id },
      data,
    });
    revalidatePath(`/admin/shorts/${id}`);
    revalidatePath(`/dashboard/shorts/${id}`);
    revalidatePath(`/dashboard/shorts`);
    return { success: true, short };
  } catch (error: any) {
    console.error("Error updating short details:", error);
    throw new Error("Failed to update short details");
  }
}

export async function markShortWatchedAction(shortId: string, userId: string) {
  try {
    const existing = await prisma.shortProgress.findUnique({
      where: { userId_shortId: { userId, shortId } },
    });

    if (!existing || !existing.watched) {
      // Fetch the short to get its score
      const short = await prisma.youTubeShort.findUnique({
        where: { id: shortId },
        select: { shortScore: true },
      });

      if (short) {
        await prisma.$transaction([
          prisma.shortProgress.upsert({
            where: { userId_shortId: { userId, shortId } },
            update: { watched: true, watchedAt: new Date() },
            create: { userId, shortId, watched: true, watchedAt: new Date() },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { totalShortScore: { increment: short.shortScore } },
          }),
        ]);
      }
    }
    revalidatePath(`/dashboard/shorts`);
    return { success: true };
  } catch (error: any) {
    console.error("Error marking short as watched:", error);
    throw new Error("Failed to mark short as watched");
  }
}

export async function toggleShortBookmarkAction(shortId: string, userId: string) {
  try {
    const existing = await prisma.shortBookmark.findUnique({
      where: {
        userId_shortId: { userId, shortId },
      },
    });

    if (existing) {
      await prisma.shortBookmark.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.shortBookmark.create({
        data: { userId, shortId },
      });
    }
    revalidatePath(`/dashboard/shorts/${shortId}`);
    revalidatePath("/dashboard/shorts");
    return { success: true, bookmarked: !existing };
  } catch (error: any) {
    console.error("Error toggling bookmark:", error);
    throw new Error("Failed to toggle bookmark");
  }
}

export async function createShortQuizAction(
  shortId: string,
  data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    answer: string;
    explanation?: string;
  }
) {
  try {
    const quiz = await prisma.shortQuiz.create({
      data: {
        shortId,
        ...data,
      },
    });
    revalidatePath(`/admin/shorts/${shortId}`);
    revalidatePath(`/dashboard/shorts/${shortId}`);
    return { success: true, quiz };
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    throw new Error("Failed to create quiz");
  }
}

export async function deleteShortQuizAction(quizId: string, shortId: string) {
  try {
    await prisma.shortQuiz.delete({
      where: { id: quizId },
    });
    revalidatePath(`/admin/shorts/${shortId}`);
    revalidatePath(`/dashboard/shorts/${shortId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    throw new Error("Failed to delete quiz");
  }
}

export async function getShortCommentsAction(shortId: string) {
  try {
    const comments = await prisma.shortComment.findMany({
      where: { shortId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function postShortCommentAction(shortId: string, userId: string, text: string) {
  try {
    if (!text.trim()) throw new Error("Comment cannot be empty");
    
    await prisma.shortComment.create({
      data: {
        shortId,
        userId,
        text: text.trim()
      }
    });
    
    revalidatePath(`/dashboard/shorts`);
    return { success: true };
  } catch (error: any) {
    console.error("Error posting comment:", error);
    throw new Error(error.message || "Failed to post comment");
  }
}

export async function getSavedShortsAction(userId: string) {
  try {
    const saved = await prisma.shortBookmark.findMany({
      where: { userId },
      include: { short: true },
      orderBy: { createdAt: "desc" }
    });
    return saved.map((b) => b.short);
  } catch (error) {
    console.error("Error getting saved shorts:", error);
    return [];
  }
}

export async function getShortNoteAction(shortId: string, userId: string) {
  try {
    const note = await prisma.shortNote.findUnique({
      where: { userId_shortId: { userId, shortId } }
    });
    return note;
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
}

export async function saveShortNoteAction(shortId: string, userId: string, content: string) {
  try {
    const note = await prisma.shortNote.upsert({
      where: { userId_shortId: { userId, shortId } },
      update: { content },
      create: {
        userId,
        shortId,
        content
      }
    });

    revalidatePath(`/dashboard/shorts/saved`);
    return note;
  } catch (error: any) {
    console.error("Error saving manual notes:", error);
    throw new Error(error.message || "Failed to save notes.");
  }
}

export async function deleteShortCommentAction(commentId: string, userId: string, userRole: string) {
  try {
    const comment = await prisma.shortComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== userId && userRole !== "ADMIN") {
      throw new Error("Unauthorized to delete this comment");
    }

    await prisma.shortComment.delete({
      where: { id: commentId }
    });

    revalidatePath(`/dashboard/shorts`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    throw new Error(error.message || "Failed to delete comment");
  }
}

