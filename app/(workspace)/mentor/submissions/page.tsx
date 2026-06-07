import { PageHeader } from "@/components/page-header";
import { SubmissionsList } from "@/components/submissions-list";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MentorSubmissionsPage() {
  const user = await requireRole("MENTOR");
  const submissions = await prisma.submission.findMany({ where: { status: "SUBMITTED", learner: { enrollments: { some: { mentorId: user.id } } } }, include: { learner: true, assignment: { include: { lesson: { include: { module: { include: { course: true } } } } } } }, orderBy: { submittedAt: "asc" } });
  return <><PageHeader title="Submission reviews" description="Review work from your assigned learners." /><SubmissionsList submissions={submissions} /></>;
}
