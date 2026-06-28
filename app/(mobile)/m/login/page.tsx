import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MobileLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/m/dashboard");

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-12 relative overflow-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      <div className="w-full max-w-[340px] z-10 flex flex-col h-full">
        <div className="mb-10 flex justify-center">
          <Brand />
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground text-center mb-2">Welcome</h2>
          <p className="mb-8 text-sm text-muted-foreground text-center px-4">
            Sign in with your employee credentials to continue.
          </p>
          
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <LoginForm />
          </div>
          
          <p className="mt-8 text-center text-xs leading-tight text-muted-foreground opacity-70">
            Internal learning and development workspace.
          </p>
        </div>
      </div>
    </main>
  );
}
