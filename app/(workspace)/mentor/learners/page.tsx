import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SendNotificationDialog } from "@/components/send-notification-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MentorLearnersPage() {
  const user = await requireRole("MENTOR");
  const enrollments = await prisma.enrollment.findMany({ where: { mentorId: user.id }, include: { learner: true, course: true } });
  return <><PageHeader title="Assigned learners" description="Learners and courses under your mentorship." /><div className="grid gap-4 md:grid-cols-2">{enrollments.map((e)=><Card key={e.id} className="p-5"><div className="flex justify-between items-start"><div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground">{e.learner.avatarUrl ? <Image src={e.learner.avatarUrl} alt="" width={40} height={40} className="size-full object-cover" /> : e.learner.name.charAt(0)}</div><div><h2 className="font-semibold">{e.learner.name}{e.learner.employeeId && <span className="ml-1.5 text-xs font-normal text-muted-foreground">({e.learner.employeeId})</span>}</h2><p className="text-sm text-muted-foreground">{e.course.title}</p></div></div><span className="text-sm font-bold">{e.progressPercent}%</span></div><Progress value={e.progressPercent} className="my-4" /><div className="flex gap-2"><Button variant="outline" size="sm" asChild className="flex-1"><Link href={`/mentor/learners/${e.learnerId}`}>View learner</Link></Button><SendNotificationDialog userId={e.learnerId} userName={e.learner.name} /></div></Card>)}</div></>;
}
