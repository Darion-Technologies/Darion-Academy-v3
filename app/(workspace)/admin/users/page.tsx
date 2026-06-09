import { assignCourseAction } from "@/app/actions/admin";
import { InviteForm } from "@/components/admin/invite-form";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  await requireRole("ADMIN");
  const [users, courses] = await Promise.all([prisma.user.findMany({ orderBy: { createdAt: "desc" } }), prisma.course.findMany({ where: { status: "PUBLISHED" } })]);
  const learners = users.filter((u) => u.role === "EMPLOYEE" || u.role === "INTERN"); const mentors = users.filter((u) => u.role === "MENTOR");
  return <><PageHeader title="Users and assignments" description="Invite teammates, control access, assign roles, and enroll learners." /><div className="grid gap-6 xl:grid-cols-2"><Card><CardHeader><CardTitle>Invite user</CardTitle></CardHeader><CardContent><InviteForm /></CardContent></Card><Card><CardHeader><CardTitle>Assign course</CardTitle></CardHeader><CardContent><form action={assignCourseAction} className="space-y-4"><div><Label>Learner</Label><Select name="learnerId">{learners.map((u)=><option key={u.id} value={u.id}>{u.name}</option>)}</Select></div><div><Label>Course</Label><Select name="courseId">{courses.map((c)=><option key={c.id} value={c.id}>{c.title}</option>)}</Select></div><div><Label>Mentor</Label><Select name="mentorId"><option value="">Unassigned</option>{mentors.map((u)=><option key={u.id} value={u.id}>{u.name}</option>)}</Select></div><SubmitButton pendingText="Assigning...">Assign course</SubmitButton></form></CardContent></Card></div><div className="mt-6"><UsersTable users={users} /></div></>;
}
