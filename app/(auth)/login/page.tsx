import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <section className="gradient-welcome relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-1/4 size-96 rounded-full border border-white/10" />
        <Brand inverse />
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-[#8fd9ee]">
            Darion Technologies
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Build skills that move our work forward.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/72">
            Courses, practical assignments, mentor feedback, and recognized completion in one focused workspace.
          </p>
        </div>
        <p className="text-sm text-white/55">Internal learning and development workspace</p>
      </section>
      <section className="flex items-center justify-center bg-card p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-[var(--shadow-md)] lg:border-0 lg:p-0 lg:shadow-none">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mb-7 mt-2 text-muted-foreground">
            Sign in with your email or Employee ID.
          </p>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access is limited to invited Darion Technologies team members.
          </p>
        </div>
      </section>
    </main>
  );
}
