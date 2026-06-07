import { PageHeader } from "@/components/page-header";
import { SubmissionsList } from "@/components/submissions-list";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSubmissionsPage() {
  await requireRole("ADMIN");
  const submissions = await prisma.submission.findMany({ where: { status: "SUBMITTED" }, include: { learner: true, assignment: { include: { lesson: { include: { module: { include: { course: true } } } } } } }, orderBy: { submittedAt: "asc" } });
  return <><PageHeader title="All submissions" description="Review pending work across the academy." /><SubmissionsList submissions={submissions} /></>;
}
