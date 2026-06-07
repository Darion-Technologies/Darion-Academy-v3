import { NextResponse } from "next/server";
import { requireRole, canReviewLearner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSignedUrl } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const reviewer = await requireRole("ADMIN", "MENTOR");
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { learnerId: true, fileUrl: true },
  });
  if (!submission?.fileUrl || !(await canReviewLearner(reviewer.id, reviewer.role, submission.learnerId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const url = await createSignedUrl("submissions", submission.fileUrl, 300);
  return NextResponse.redirect(url);
}
