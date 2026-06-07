"use client";

import { useState, useActionState } from "react";
import { loginAction, loginWithEmployeeIdAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, IdCard } from "lucide-react";
import Link from "next/link";

type LoginMethod = "email" | "employeeId";

export function LoginForm() {
  const [method, setMethod] = useState<LoginMethod>("email");
  const [emailState, emailAction, emailPending] = useActionState(loginAction, {});
  const [empState, empAction, empPending] = useActionState(loginWithEmployeeIdAction, {});

  const state = method === "email" ? emailState : empState;
  const action = method === "email" ? emailAction : empAction;
  const pending = method === "email" ? emailPending : empPending;

  return (
    <div>
      {/* Tab switcher */}
      <div className="mb-6 flex rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
            method === "email"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="size-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod("employeeId")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
            method === "employeeId"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IdCard className="size-4" />
          Employee ID
        </button>
      </div>

      <form action={action} className="space-y-4">
        {method === "email" ? (
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@darion.com"
              required
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="text"
              autoComplete="username"
              placeholder="DT-00142"
              required
            />
          </div>
        )}

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-[var(--error-light)] p-3 text-sm text-[var(--error)]">{state.error}</p>
        )}

        <Button className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-4 text-right">
        <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
