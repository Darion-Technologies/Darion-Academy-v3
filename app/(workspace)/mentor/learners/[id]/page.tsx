import { approveCompletionAction } from "@/app/actions/review";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function MentorLearnerPage({ params }: { params: Promise<{ id: string }> }) {
  const mentor = await requireRole("MENTOR"); const { id } = await params;
  const learner = await prisma.user.findFirst({ where: { id, enrollments: { some: { mentorId: mentor.id } } }, include: { enrollments: { where: { mentorId: mentor.id }, include: { course: true } }, quizAttempts: { orderBy: { submittedAt: "desc" }, take: 5, include: { quiz: true } } } });
  if (!learner) notFound();
  return <><PageHeader title={learner.name} description={`${learner.email} · ${learner.department ?? "No department"}`} /><div className="space-y-5">{learner.enrollments.map((e)=><Card key={e.id}><CardHeader><div className="flex justify-between"><CardTitle>{e.course.title}</CardTitle><Badge>{e.status.replaceAll("_"," ")}</Badge></div></CardHeader><CardContent><div className="mb-2 flex justify-between text-sm"><span>Course progress</span><span>{e.progressPercent}%</span></div><Progress value={e.progressPercent} />{e.status === "AWAITING_APPROVAL" && <form action={approveCompletionAction} className="mt-5"><input type="hidden" name="enrollmentId" value={e.id} /><SubmitButton pendingText="Approving...">Approve completion</SubmitButton></form>}</CardContent></Card>)}</div></>;
}
