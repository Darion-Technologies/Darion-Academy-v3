"use server";

import { cache as reactCache } from "react";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ConversationType } from "@/generated/prisma";
import { uploadPrivateFile } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

// Get all conversations for the current user
export async function getConversationsAction() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Calculate unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const myParticipant = conv.participants.find((p) => p.userId === user.id);
      let unreadCount = 0;
      
      if (myParticipant && conv.messages.length > 0) {
        if (!myParticipant.lastReadMessageId) {
          // If no last read message, all messages might be unread. 
          // We can count all messages not sent by the user.
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: user.id }
            }
          });
        } else {
          // Find the last read message to get its createdAt
          const lastReadMessage = await prisma.message.findUnique({
            where: { id: myParticipant.lastReadMessageId },
            select: { createdAt: true }
          });
          
          if (lastReadMessage) {
            unreadCount = await prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: { gt: lastReadMessage.createdAt },
                senderId: { not: user.id }
              }
            });
          }
        }
      }
      
      return {
        ...conv,
        unreadCount
      };
    })
  );

  return conversationsWithUnread;
}

// Mark conversation as read
export async function markConversationAsReadAction(conversationId: string, messageId: string) {
  const user = await requireUser();

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { 
      lastReadMessageId: messageId,
      lastReadAt: new Date(),
      lastDeliveredAt: new Date() // If read, it's also delivered
    }
  });

  // revalidatePath("/chat");
  return { success: true };
}

// Mark conversation as delivered
export async function markConversationAsDeliveredAction(conversationId: string) {
  const user = await requireUser();

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { lastDeliveredAt: new Date() }
  });

  return { success: true };
}

export const getUnreadChatCountAction = reactCache(async () => {
  try {
    const user = await requireUser();
    
    // Fast direct query: find conversations where a message exists that is newer than our last read
    const unreadConvs = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      select: { conversationId: true, lastReadAt: true },
    });
    
    if (!unreadConvs.length) return 0;
    
    // We do a single fast count of conversations with newer messages
    const unreadCount = await prisma.conversation.count({
      where: {
        id: { in: unreadConvs.map(p => p.conversationId) },
        messages: {
          some: {
            senderId: { not: user.id },
            // If they never read anything, any message not from them is unread.
            // If they did read something, find messages newer than lastReadAt
            ...(unreadConvs.some(p => p.lastReadAt) 
              ? { createdAt: { gt: unreadConvs.find(p => p.conversationId)?.lastReadAt || new Date(0) } } 
              : {})
          }
        }
      }
    });

    return unreadCount;
  } catch (err) {
    return 0;
  }
});

// Get messages for a specific conversation
export async function getMessagesAction(conversationId: string) {
  const user = await requireUser();

  // Verify access
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });

  if (!participant) {
    throw new Error("Unauthorized to view this conversation.");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Automatically mark as read if there are messages
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (participant.lastReadMessageId !== lastMessage.id || !participant.lastReadAt) {
      await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { 
          lastReadMessageId: lastMessage.id,
          lastReadAt: new Date(),
          lastDeliveredAt: new Date()
        },
      });
      // We don't block the return on revalidation
    }
  }

  return messages;
}

// Send a new message
export async function sendMessageAction(conversationId: string, content: string, attachmentUrl?: string, attachmentType?: string) {
  const user = await requireUser();

  if (!content.trim() && !attachmentUrl) {
    throw new Error("Message content cannot be empty.");
  }

  // Verify access
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });

  if (!participant) {
    throw new Error("Unauthorized to send a message to this conversation.");
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content,
      attachmentUrl,
      attachmentType,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Revalidate to trigger server component updates
  // Removed to prevent UI lag/reloading during active chatting
  // revalidatePath("/chat");
  // revalidatePath(`/chat/${conversationId}`);

  return message;
}

// Upload an attachment for a chat message
export async function uploadChatAttachmentAction(formData: FormData) {
  try {
    const user = await requireUser();
    const file = formData.get("file") as File | null;
    
    if (!file || file.size === 0) {
      return { error: "No file uploaded." };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "Only image attachments are currently supported." };
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { error: "Attachment must be under 10MB." };
    }

    const extension = file.type.split("/")[1] || "png";
    const filename = `chat-${user.id}-${Date.now()}.${extension}`;
    
    // Upload to Supabase (using profile-images as the fallback reliable bucket)
    const safePath = await uploadPrivateFile("profile-images", filename, file);
    
    // Get public URL
    const supabase = createAdminClient();
    const { data: publicData } = supabase.storage.from("profile-images").getPublicUrl(safePath);
    
    return { success: true, attachmentUrl: publicData.publicUrl, attachmentType: "image" };
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return { error: error.message || "Upload failed due to a server error." };
  }
}

// Create a new conversation
export async function createConversationAction(userIds: string[], type: ConversationType, name?: string) {
  const user = await requireUser();

  const allUserIds = [...new Set([user.id, ...userIds])];

  if (allUserIds.length < 2) {
    throw new Error("A conversation must have at least two participants.");
  }

  // Check if a direct conversation already exists between these 2 users
  if (type === "DIRECT" && allUserIds.length === 2) {
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { userId: allUserIds[0] } } },
          { participants: { some: { userId: allUserIds[1] } } },
        ],
      },
    });
    if (existing) {
      return existing.id;
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      type,
      name,
      participants: {
        create: allUserIds.map((id) => ({
          userId: id,
          role: id === user.id ? "ADMIN" : "MEMBER",
        })),
      },
    },
  });

  revalidatePath("/chat");
  return conversation.id;
}

// Get available users for a new conversation
export async function getAvailableUsersAction(query: string = "") {
  const user = await requireUser();

  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      active: true,
      name: { contains: query, mode: "insensitive" },
    },
    select: { id: true, name: true, avatarUrl: true, role: true },
    take: 20,
    orderBy: { name: "asc" }
  });

  return users;
}
