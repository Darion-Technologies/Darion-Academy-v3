import { getCurrentUser, roleHome } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, PlaySquare, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const user = await getCurrentUser();
  const ctaLink = user ? roleHome[user.role] : "/login";
  const ctaText = user ? "Go to Dashboard" : "Sign In to Academy";
  const randomImage = Math.floor(Math.random() * 3) + 1;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Navbar */}
      <header className="absolute inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-6 bg-transparent">
        <Brand inverse />
        <Button asChild variant={user ? "outline" : "default"} className="rounded-none font-semibold bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-md">
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden border-b py-32 sm:py-48 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url('/login-bg-${randomImage}.jpg')` }}
        >
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/70 mix-blend-multiply" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
            <div className="mb-6 inline-flex items-center rounded-none border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold tracking-wide text-white backdrop-blur-md">
              <ShieldCheck className="mr-2 size-4" /> Internal Network Only
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8 drop-shadow-lg">
              Darion Skill Enhancement Programme
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90 sm:text-2xl leading-relaxed mb-10 drop-shadow-md">
              The internal knowledge engine of Darion Technologies. Accelerate your career with interactive courses, mentorship, and bite-sized technical insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-none text-base font-semibold h-14 px-10 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                <Link href={ctaLink}>
                  {ctaText} <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Platform Capabilities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="border border-border bg-card flex flex-col shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
                <div className="h-48 w-full overflow-hidden border-b border-border">
                  <img src="/login-bg-1.jpg" alt="Interactive Courses" className="h-full w-full object-cover transition-transform hover:scale-105 duration-700" />
                </div>
                <div className="p-8 flex-1">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                    <BookOpen className="size-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Interactive Courses</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Engage with structured curriculum, hands-on assignments, and quizzes designed to test your operational readiness.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="border border-border bg-card flex flex-col shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
                <div className="h-48 w-full overflow-hidden border-b border-border">
                  <img src="/login-bg-2.jpg" alt="Tech Shorts" className="h-full w-full object-cover transition-transform hover:scale-105 duration-700" />
                </div>
                <div className="p-8 flex-1">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                    <PlaySquare className="size-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Tech Shorts</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Consume bite-sized, vertically scrolling video insights created by senior engineers to stay sharp on the go.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="border border-border bg-card flex flex-col shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
                <div className="h-48 w-full overflow-hidden border-b border-border">
                  <img src="/login-bg-3.jpg" alt="Internal Certification" className="h-full w-full object-cover transition-transform hover:scale-105 duration-700" />
                </div>
                <div className="p-8 flex-1">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                    <GraduationCap className="size-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Internal Certification</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Earn verifiable credentials upon course completion to showcase your expanded skill set within the company.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Darion Technologies. All rights reserved.</p>
        <p className="mt-1 text-xs">Proprietary and Confidential.</p>
      </footer>
    </div>
  );
}
