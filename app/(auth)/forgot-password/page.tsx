import Link from "next/link";
import { Brand } from "@/components/brand";
import { RecoveryForm } from "@/components/auth/recovery-form";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-md border bg-card p-8 shadow-[var(--shadow-md)]">
        <Brand />
        <p className="mt-10 section-label text-primary">Account recovery</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-muted-foreground">We will send a secure password setup link to your verified work email.</p>
        <RecoveryForm />
        <Link href="/login" className="mt-6 block text-center text-xs font-semibold text-primary">Return to sign in</Link>
      </section>
    </main>
  );
}
