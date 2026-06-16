import { Award } from "lucide-react";
import { CertificateButton } from "@/components/certificate-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function CertificatesPage() {
  const user = await requireUser();
  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    include: { course: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Verified credentials for approved course completions."
      />

      {!certificates.length ? (
        <div className="mb-8 bg-[#fafafa] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm border border-gray-100 max-w-4xl mx-auto">
          {/* Exact UI Promo Card (Soft, Rounded, Glassmorphic) - Very Compact Horizontal Layout */}
          {/* Subtle binary background pattern */}
          <div className="absolute inset-0 opacity-[0.04] font-mono text-xs leading-[2.5] flex flex-wrap content-start overflow-hidden select-none pointer-events-none text-gray-500" aria-hidden="true">
            {Array.from({ length: 400 }).map((_, i) => (
              <span key={i} className="mx-4">{(i % 3 === 0 || i % 7 === 0) ? '0' : '1'}</span>
            ))}
          </div>
          
          {/* Left Side: Text */}
          <div className="relative z-10 w-full md:w-1/2 md:pr-8 mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
              Code signing made easy
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Our guided process makes purchasing and using certificates a breeze. Our secure hardware storage and expiry notifications give you peace of mind.
            </p>
          </div>

          {/* Right Side: Central UI Composition (Scaled down) */}
          <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center md:justify-end">
            <div className="relative w-[320px] h-[180px] flex items-center justify-center transform scale-75 origin-center md:origin-right">
              {/* The floating window */}
              <div className="w-64 h-36 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col relative transform -rotate-3 z-10">
                {/* macOS style dots */}
                <div className="flex gap-1.5 p-4">
                  <div className="size-2.5 rounded-full bg-gray-200" />
                  <div className="size-2.5 rounded-full bg-gray-200" />
                  <div className="size-2.5 rounded-full bg-gray-200" />
                </div>
                
                {/* Signature Area */}
                <div className="flex-1 flex items-center justify-center relative px-8 pb-4">
                  {/* Underline */}
                  <div className="absolute bottom-6 left-12 right-12 h-[2px] bg-gray-100 flex items-center">
                    <span className="absolute -left-6 text-gray-300 text-sm font-serif italic">x</span>
                  </div>
                  {/* Signature SVG */}
                  <svg viewBox="0 0 100 40" fill="none" stroke="#4b5563" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full relative z-10 transform translate-y-1">
                    <path d="M10 25 C 20 5, 30 5, 25 35 C 25 35, 45 15, 55 25 C 60 30, 70 20, 80 25 C 90 30, 95 15, 95 15" />
                  </svg>
                </div>

                {/* Golden Seal Badge */}
                <div className="absolute -bottom-6 -left-6 size-24 drop-shadow-xl transform rotate-12 z-30">
                  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Ribbons */}
                    <path d="M30 70 L15 110 L35 100 L50 115 L50 70 Z" fill="#d97706" />
                    <path d="M70 70 L85 110 L65 100 L50 115 L50 70 Z" fill="#d97706" />
                    {/* Starburst Badge */}
                    <path d="M50 5 L60 20 L75 15 L80 30 L95 35 L85 50 L95 65 L80 70 L75 85 L60 80 L50 95 L40 80 L25 85 L20 70 L5 65 L15 50 L5 35 L20 30 L25 15 L40 20 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                    {/* Inner Circle */}
                    <circle cx="50" cy="50" r="22" fill="#fbbf24" stroke="#fef3c7" strokeWidth="4" />
                    {/* Checkmark */}
                    <path d="M35 50 L45 60 L65 40" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* The Stylus Pen */}
                <div className="absolute -top-8 right-[-45px] w-48 h-9 transform rotate-[40deg] drop-shadow-2xl z-30 pointer-events-none">
                  <div className="flex w-full h-full rounded-full shadow-lg">
                    {/* Pen tip/cone */}
                    <div className="w-[15%] h-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-l-full relative flex items-center justify-end overflow-hidden">
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-500 rounded-full" />
                    </div>
                    {/* Blue grip */}
                    <div className="w-[20%] h-full bg-blue-600 flex items-center justify-center text-white">
                      {/* Mock 'd' icon representing the logo on the pen */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 transform -rotate-90">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2V7h2v10zm4 0h-2V7h2v10z"/>
                      </svg>
                    </div>
                    {/* Pen body */}
                    <div className="flex-1 h-full bg-gradient-to-r from-gray-50 to-gray-200 flex items-center px-4 border-y border-gray-300 relative">
                       <span className="text-[7px] text-gray-400 font-bold tracking-[0.2em] uppercase opacity-70">toDesktop</span>
                       {/* Cylinder highlight */}
                       <div className="absolute top-1 left-0 right-0 h-1.5 bg-white/60 rounded-full" />
                    </div>
                    {/* Pen back/eraser */}
                    <div className="w-[10%] h-full bg-gray-300 rounded-r-full shadow-inner border-l border-gray-400 relative">
                      <div className="absolute inset-y-1.5 right-1.5 w-1 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="flex items-stretch overflow-hidden border bg-card shadow-[var(--shadow-sm)]"
            >
              {/* Award icon panel */}
              <div className="bg-[var(--info-light)] border-r border-border flex items-center justify-center p-5 shrink-0">
                <Award className="size-8 text-primary" />
              </div>

              {/* Certificate info */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <Badge
                    variant={
                      c.status === "REVOKED"   ? "error"
                      : c.status === "GENERATED" ? "success"
                      : c.status === "ELIGIBLE"  ? "info"
                      : "neutral"
                    }
                  >
                    {c.status}
                  </Badge>
                  <h2 className="mt-2.5 font-bold text-foreground">{c.course.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {c.user.name} &middot;{" "}
                    <span className="font-mono text-xs">{c.certificateId}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Issued: {c.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <a
                    className="text-xs font-semibold text-primary transition-colors hover:text-[var(--primary-hover)]"
                    href={`/verify/${c.certificateId}`}
                    target="_blank"
                  >
                    Public link →
                  </a>
                  {["GENERATED", "ELIGIBLE"].includes(c.status) && (
                    <CertificateButton id={c.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
