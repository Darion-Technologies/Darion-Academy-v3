import { Brand } from "@/components/brand";
import { PasswordForm } from "@/components/auth/password-form";
import { requireUser } from "@/lib/auth";

export default async function ResetPasswordPage() {
  await requireUser();
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-[var(--shadow-md)]">
        <Brand />
        <p className="mt-10 section-label text-primary">Secure access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-muted-foreground">Use at least eight characters. This password will apply across all signed-in devices.</p>
        <PasswordForm />
      </section>
    </main>
  );
}
