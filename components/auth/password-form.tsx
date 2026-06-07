"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, {});
  return <form action={action} className="space-y-3"><div><Label>New password</Label><Input name="password" type="password" minLength={8} required /></div>{state.error && <p className="text-sm text-red-600">{state.error}</p>}{state.success && <p className="text-sm text-emerald-600">{state.success}</p>}<Button disabled={pending}>{pending ? "Updating..." : "Update password"}</Button></form>;
}
