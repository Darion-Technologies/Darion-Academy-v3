import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MentorLearnersPage() {
  const user = await requireRole("MENTOR");
  const enrollments = await prisma.enrollment.findMany({ where: { mentorId: user.id }, include: { learner: true, course: true } });
  return <><PageHeader title="Assigned learners" description="Learners and courses under your mentorship." /><div className="grid gap-4 md:grid-cols-2">{enrollments.map((e)=><Card key={e.id} className="p-5"><div className="flex justify-between"><div><h2 className="font-semibold">{e.learner.name}</h2><p className="text-sm text-muted-foreground">{e.course.title}</p></div><span className="text-sm font-bold">{e.progressPercent}%</span></div><Progress value={e.progressPercent} className="my-4" /><Button variant="outline" size="sm" asChild><Link href={`/mentor/learners/${e.learnerId}`}>View learner</Link></Button></Card>)}</div></>;
}
