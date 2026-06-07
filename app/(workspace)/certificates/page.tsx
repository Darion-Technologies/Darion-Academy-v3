import { Award } from "lucide-react";
import { CertificateButton } from "@/components/certificate-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        <EmptyState
          title="No certificates yet"
          description="Certificates are generated automatically after course approval."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="flex items-stretch overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-sm)]"
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
                    Verify credential →
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
