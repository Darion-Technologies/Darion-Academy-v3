import { BookOpen, CheckCircle2, Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  await requireRole("ADMIN");
  const [users, courses, pending, enrollments, activity] = await Promise.all([
    prisma.user.count(), prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.submission.count({ where: { status: "SUBMITTED" } }),
    prisma.enrollment.findMany({ select: { progressPercent: true } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: true } }),
  ]);
  const average = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + item.progressPercent, 0) / enrollments.length) : 0;
  return <><PageHeader title="Admin overview" description="Organization-wide learning operations at a glance." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total users" value={users} icon={Users} /><StatCard label="Active courses" value={courses} icon={BookOpen} /><StatCard label="Pending submissions" value={pending} icon={Clock} /><StatCard label="Average completion" value={`${average}%`} icon={CheckCircle2} /></div><Card className="mt-6"><CardHeader><CardTitle>Recent activity</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{activity.map((item) => <TableRow key={item.id}><TableCell>{item.actor?.name ?? "System"}</TableCell><TableCell>{item.action}</TableCell><TableCell>{item.entityType}</TableCell><TableCell>{item.createdAt.toLocaleDateString()}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></>;
}
