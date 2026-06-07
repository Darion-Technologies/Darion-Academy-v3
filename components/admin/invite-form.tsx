"use client";

import { useActionState } from "react";
import { inviteUserAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteUserAction, {});
  return <form action={action} className="grid gap-4 md:grid-cols-2">
    <div><Label>Name</Label><Input name="name" required /></div><div><Label>Email</Label><Input name="email" type="email" required /></div>
    <div><Label>Role</Label><Select name="role"><option value="EMPLOYEE">Employee</option><option value="INTERN">Intern</option><option value="MENTOR">Mentor</option><option value="ADMIN">Admin</option></Select></div>
    <div><Label>Department</Label><Input name="department" required /></div>
    <div className="md:col-span-2"><Label>Employee ID <span className="font-normal text-muted-foreground">(required for employees and interns)</span></Label><Input name="employeeId" /></div>
    {state.error && <p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}{state.success && <p className="text-sm text-emerald-600 md:col-span-2">{state.success}</p>}
    <div className="md:col-span-2"><Button disabled={pending}>{pending ? "Sending..." : "Send invitation"}</Button></div>
  </form>;
}
