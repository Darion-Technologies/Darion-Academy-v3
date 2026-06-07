import { DepartmentChart } from "@/components/analytics-charts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  await requireRole("ADMIN");
  const enrollments = await prisma.enrollment.findMany({ include: { learner: true, course: true }, orderBy: { progressPercent: "desc" } });
  const byDepartment = new Map<string, number[]>();
  enrollments.forEach((e) => { const key = e.learner.department ?? "Unassigned"; byDepartment.set(key, [...(byDepartment.get(key) ?? []), e.progressPercent]); });
  const chart = [...byDepartment].map(([name, values]) => ({ name, progress: Math.round(values.reduce((a,b)=>a+b,0)/values.length) }));
  return <><PageHeader title="Reports" description="Completion performance across departments and learners." /><div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]"><Card><CardHeader><CardTitle>Department progress</CardTitle></CardHeader><CardContent><DepartmentChart data={chart} /></CardContent></Card><Card><CardHeader><CardTitle>Top learners</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Learner</TableHead><TableHead>Course</TableHead><TableHead>Progress</TableHead></TableRow></TableHeader><TableBody>{enrollments.slice(0,10).map((e)=><TableRow key={e.id}><TableCell>{e.learner.name}</TableCell><TableCell>{e.course.title}</TableCell><TableCell>{e.progressPercent}%</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div></>;
}
