"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ConversationType } from "@/generated/prisma";

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

  return conversations;
}

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

  return messages;
}

// Send a new message
export async function sendMessageAction(conversationId: string, content: string) {
  const user = await requireUser();

  if (!content.trim()) {
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
  revalidatePath("/chat");
  revalidatePath(`/chat/${conversationId}`);

  return message;
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
