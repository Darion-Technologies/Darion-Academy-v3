import { assignCourseAction, updateUserAccessAction } from "@/app/actions/admin";
import { InviteForm } from "@/components/admin/invite-form";
import { SendNotificationDialog } from "@/components/send-notification-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  await requireRole("ADMIN");
  const [users, courses] = await Promise.all([prisma.user.findMany({ orderBy: { createdAt: "desc" } }), prisma.course.findMany({ where: { status: "PUBLISHED" } })]);
  const learners = users.filter((u) => u.role === "EMPLOYEE" || u.role === "INTERN"); const mentors = users.filter((u) => u.role === "MENTOR");
  return <><PageHeader title="Users and assignments" description="Invite teammates, control access, assign roles, and enroll learners." /><div className="grid gap-6 xl:grid-cols-2"><Card><CardHeader><CardTitle>Invite user</CardTitle></CardHeader><CardContent><InviteForm /></CardContent></Card><Card><CardHeader><CardTitle>Assign course</CardTitle></CardHeader><CardContent><form action={assignCourseAction} className="space-y-4"><div><Label>Learner</Label><Select name="learnerId">{learners.map((u)=><option key={u.id} value={u.id}>{u.name}</option>)}</Select></div><div><Label>Course</Label><Select name="courseId">{courses.map((c)=><option key={c.id} value={c.id}>{c.title}</option>)}</Select></div><div><Label>Mentor</Label><Select name="mentorId"><option value="">Unassigned</option>{mentors.map((u)=><option key={u.id} value={u.id}>{u.name}</option>)}</Select></div><SubmitButton pendingText="Assigning...">Assign course</SubmitButton></form></CardContent></Card></div><Card className="mt-6"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Employee ID</TableHead><TableHead>Department</TableHead><TableHead>Access</TableHead></TableRow></TableHeader><TableBody>{users.map((u)=><TableRow key={u.id}><TableCell><div className="flex items-center gap-3"><div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground">{u.avatarUrl ? <img src={u.avatarUrl} alt="" className="size-full object-cover" /> : u.name.charAt(0)}</div><div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div></TableCell><TableCell><Badge>{u.role}</Badge></TableCell><TableCell>{u.employeeId ?? "—"}</TableCell><TableCell>{u.department ?? "—"}</TableCell><TableCell><div className="flex items-center gap-2"><form action={updateUserAccessAction} className="flex min-w-64 items-end gap-2"><input type="hidden" name="userId" value={u.id}/><div><Label className="sr-only">Role</Label><Select name="role" defaultValue={u.role}><option value="EMPLOYEE">Employee</option><option value="INTERN">Intern</option><option value="MENTOR">Mentor</option><option value="ADMIN">Admin</option></Select></div><div><Label className="sr-only">Status</Label><Select name="active" defaultValue={String(u.active)}><option value="true">Active</option><option value="false">Inactive</option></Select></div><SubmitButton size="sm" variant="outline" pendingText="Saving...">Save</SubmitButton></form><SendNotificationDialog userId={u.id} userName={u.name} /></div></TableCell></TableRow>)}</TableBody></Table></Card></>;
}
