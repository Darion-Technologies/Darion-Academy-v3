"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RecoveryForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && <p className="border-l-2 border-red-600 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="border-l-2 border-emerald-600 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p>}
      <Button className="w-full" disabled={pending}>{pending ? "Sending..." : "Send recovery link"}</Button>
    </form>
  );
}
