"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logCallAction(conversationId: string, durationSeconds: number, isVideo: boolean) {
  const user = await requireUser();
  
  // Format the call log string
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };
  
  const callType = isVideo ? "Video Call" : "Voice Call";
  const content = durationSeconds > 0 
    ? `📞 ${callType} ended (${formatDuration(durationSeconds)})`
    : `📞 Missed ${callType}`;

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content,
      attachmentType: "call_log", // special type so UI could render it differently if needed
    }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return { success: true };
}
