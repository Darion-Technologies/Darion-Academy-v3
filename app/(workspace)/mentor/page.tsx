import { BookOpen, ClipboardCheck, Clock, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MentorDashboard() {
  const user = await requireRole("MENTOR");
  const [enrollments, pending] = await Promise.all([
    prisma.enrollment.findMany({ where: { mentorId: user.id }, include: { learner: true, course: true }, orderBy: { assignedAt: "desc" } }),
    prisma.submission.count({ where: { status: "SUBMITTED", learner: { enrollments: { some: { mentorId: user.id } } } } }),
  ]);
  return <><PageHeader title="Mentor overview" description="Review work and guide your assigned learners." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Assigned learners" value={new Set(enrollments.map((e) => e.learnerId)).size} icon={Users} /><StatCard label="Active enrollments" value={enrollments.length} icon={BookOpen} /><StatCard label="Pending reviews" value={pending} icon={Clock} /><StatCard label="Awaiting approval" value={enrollments.filter((e) => e.status === "AWAITING_APPROVAL").length} icon={ClipboardCheck} /></div><Card className="mt-6"><CardHeader><CardTitle>Learner progress</CardTitle></CardHeader><CardContent className="space-y-4">{enrollments.slice(0, 8).map((item) => <div key={item.id} className="grid items-center gap-3 border-b pb-4 last:border-0 md:grid-cols-[1fr_1fr_180px_auto]"><div><p className="font-medium">{item.learner.name}</p><p className="text-xs text-muted-foreground">{item.learner.email}</p></div><p className="text-sm">{item.course.title}</p><div><div className="mb-1 flex justify-between text-xs"><span>Progress</span><span>{item.progressPercent}%</span></div><Progress value={item.progressPercent} /></div><Button variant="outline" size="sm" asChild><Link href={`/mentor/learners/${item.learnerId}`}>View</Link></Button></div>)}</CardContent></Card></>;
}
