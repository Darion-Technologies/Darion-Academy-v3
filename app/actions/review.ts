"use server";

import { revalidatePath } from "next/cache";
import { requireRole, canReviewLearner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshEnrollmentProgress } from "@/lib/progress";
import { issueCertificate } from "@/lib/certificate";

export async function reviewSubmissionAction(formData: FormData) {
  const reviewer = await requireRole("ADMIN", "MENTOR");
  const submissionId = String(formData.get("submissionId") ?? "");
  const status = String(formData.get("status") ?? "") as "APPROVED" | "REJECTED" | "NEEDS_CORRECTION";
  const message = String(formData.get("feedback") ?? "").trim();
  if (!["APPROVED", "REJECTED", "NEEDS_CORRECTION"].includes(status)) throw new Error("Invalid review status.");
  const submission = await prisma.submission.findUniqueOrThrow({ where: { id: submissionId }, include: { assignment: { include: { lesson: { include: { module: true } } } } } });
  if (submission.status !== "SUBMITTED") throw new Error("Only submitted assignments can be reviewed.");
  if (!(await canReviewLearner(reviewer.id, reviewer.role, submission.learnerId))) throw new Error("You cannot review this learner.");
  await prisma.$transaction(async (tx) => {
    await tx.submission.update({ where: { id: submissionId }, data: { status, reviewerId: reviewer.id, reviewedAt: new Date() } });
    if (message) await tx.feedback.create({ data: { submissionId, authorId: reviewer.id, message } });
    await tx.notification.create({ data: { userId: submission.learnerId, type: message ? "FEEDBACK_ADDED" : "SUBMISSION_REVIEWED", title: "Submission reviewed", message: `Your submission is now ${status.replaceAll("_", " ").toLowerCase()}.`, href: `/lessons/${submission.assignment.lessonId}` } });
    await tx.activityLog.create({ data: { actorId: reviewer.id, action: `Reviewed submission: ${status}`, entityType: "Submission", entityId: submissionId } });
  });
  await refreshEnrollmentProgress(prisma, submission.learnerId, submission.assignment.lesson.module.courseId);
  revalidatePath("/mentor/submissions");
  revalidatePath("/admin/submissions");
}

export async function approveCompletionAction(formData: FormData) {
  const reviewer = await requireRole("ADMIN", "MENTOR");
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId }, include: { learner: true, course: true } });
  if (enrollment.progressPercent !== 100) throw new Error("Course requirements are not complete.");
  if (!(await canReviewLearner(reviewer.id, reviewer.role, enrollment.learnerId))) throw new Error("You cannot approve this learner.");
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "COMPLETED", approvedAt: new Date(), completedAt: new Date() },
  });
  await prisma.activityLog.create({ data: { actorId: reviewer.id, action: "Approved course completion", entityType: "Enrollment", entityId: enrollmentId } });
  const existing = await prisma.certificate.findFirst({
    where: { enrollmentId, status: { not: "REVOKED" } },
    orderBy: { createdAt: "desc" },
  });
  if (!existing || existing.status !== "GENERATED") {
    try {
      await issueCertificate({
        enrollmentId,
        issuerId: reviewer.id,
        certificateDbId: existing?.id,
      });
    } catch {
      // The issuance service records FAILED state for an admin retry.
    }
  }
  revalidatePath(`/mentor/learners/${enrollment.learnerId}`);
  revalidatePath("/certificates");
}
