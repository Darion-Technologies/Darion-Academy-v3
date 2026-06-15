import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const randomImage = 1;

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <section 
        className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url('/login-bg-${randomImage}.jpg')` }}
      >
        {/* Dark overlay to ensure the text remains readable against the bright backgrounds */}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="pointer-events-none absolute -right-24 top-1/4 size-96 border border-white/10 z-10" />
        
        <div className="relative z-10">
          <Brand inverse />
        </div>
        
        <div className="max-w-xl relative z-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-[#8fd9ee] drop-shadow-md">
            Darion Technologies
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight drop-shadow-lg">
            Build skills that move our work forward.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-md">
            Courses, practical assignments, mentor feedback, and recognized completion in one focused workspace.
          </p>
        </div>
        
        <p className="text-sm text-white/70 relative z-10 drop-shadow-md">
          Internal learning and development workspace
        </p>
      </section>
      
      <section className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-6 lg:min-h-screen lg:bg-card lg:p-6 z-20">
        <div className="w-full max-w-[340px] lg:max-w-md lg:lg:p-0">
          <div className="mb-6 flex justify-center lg:hidden"><Brand /></div>
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">Welcome back</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground lg:mb-7 lg:mt-2 lg:text-base">
            Sign in with your email or Employee ID.
          </p>
          <LoginForm />
          <p className="mt-5 text-center text-[11px] leading-tight text-muted-foreground lg:mt-6 lg:text-xs">
            Access is limited to invited Darion Technologies team members.
          </p>
        </div>
      </section>
    </main>
  );
}
