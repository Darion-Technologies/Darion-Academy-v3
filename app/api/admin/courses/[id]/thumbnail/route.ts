import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrivateUploadMaxBytes, uploadPrivateFile } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

const bucket = "course-files";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      thumbnailUrl: true,
      enrollments: {
        where: user.role === "ADMIN"
          ? undefined
          : { OR: [{ learnerId: user.id }, { mentorId: user.id }] },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!course?.thumbnailUrl || (user.role !== "ADMIN" && course.enrollments.length === 0)) {
    return NextResponse.json({ error: "Thumbnail not found." }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).download(course.thumbnailUrl);

  if (error || !data) {
    return NextResponse.json({ error: "Thumbnail could not be downloaded." }, { status: 404 });
  }

  const arrayBuffer = await data.arrayBuffer();
  
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const maxBytes = getPrivateUploadMaxBytes(bucket);
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxBytes) {
    return NextResponse.json({ error: "The selected file exceeds the allowed size." }, { status: 413 });
  }

  const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) {
    return NextResponse.json({ error: "Select a thumbnail image." }, { status: 400 });
  }
  if (bytes.byteLength > maxBytes) {
    return NextResponse.json({ error: "The selected file exceeds the allowed size." }, { status: 413 });
  }

  const encodedName = request.headers.get("x-file-name") ?? "thumbnail";
  let fileName = "thumbnail";
  try {
    fileName = decodeURIComponent(encodedName);
  } catch {
    return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
  }

  try {
    const file = new File([bytes], fileName, {
      type: request.headers.get("content-type") ?? "application/octet-stream",
    });
    const thumbnailUrl = await uploadPrivateFile(
      bucket,
      `${course.id}/thumbnail-${Date.now()}-${file.name}`,
      file,
    );
    await prisma.$transaction([
      prisma.course.update({ where: { id: course.id }, data: { thumbnailUrl } }),
      prisma.activityLog.create({
        data: {
          actorId: admin.id,
          action: "Updated course thumbnail",
          entityType: "Course",
          entityId: course.id,
        },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      ["The selected file exceeds the allowed size.", "This file type is not allowed."].includes(error.message)
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "The thumbnail could not be uploaded." }, { status: 500 });
  }
}
