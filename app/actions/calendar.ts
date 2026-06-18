"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function createPersonalEventAction(data: { title: string; description: string; date: Date }) {
  const user = await requireUser();

  const event = await prisma.personalEvent.create({
    data: {
      userId: user.id,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      color: "blue",
    },
  });

  revalidateTag(`calendar-${user.id}`, "default");
  return { success: true, event };
}

export async function deletePersonalEventAction(id: string) {
  const user = await requireUser();

  await prisma.personalEvent.deleteMany({
    where: {
      id: id,
      userId: user.id, // Ensure user owns the event
    },
  });

  revalidateTag(`calendar-${user.id}`, "default");
  return { success: true };
}
