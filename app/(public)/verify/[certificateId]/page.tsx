import { Award, Ban, CheckCircle2, SearchX } from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function VerifyCertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { certificateId },
    include: { user: true, course: true, enrollment: true, issuer: true, replacements: { where: { status: "GENERATED" }, take: 1 } },
  });
  const valid = certificate?.status === "GENERATED";
  const revoked = certificate?.status === "REVOKED";
  return (
    <main className="min-h-screen bg-muted p-4 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <Brand />
        <Card className="mt-6 sm:mt-10 rounded-none shadow-sm">
          <CardContent className="p-5 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <span
                className={`p-3 sm:p-4 shrink-0 ${
                  valid
                    ? "bg-emerald-50 text-emerald-700"
                    : revoked
                      ? "bg-red-50 text-red-700"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {valid ? (
                  <CheckCircle2 className="size-7 sm:size-9" />
                ) : revoked ? (
                  <Ban className="size-7 sm:size-9" />
                ) : (
                  <SearchX className="size-7 sm:size-9" />
                )}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Credential verification
                </p>
                <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold">
                  {valid
                    ? "Valid certificate"
                    : revoked
                      ? "Revoked certificate"
                      : "Certificate not valid"}
                </h1>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                  {valid
                    ? "This credential was issued by Darion Technologies."
                    : revoked
                      ? "This credential is no longer valid."
                      : "No issued credential matches this ID."}
                </p>
              </div>
            </div>

            {certificate && (valid || revoked) && (
              <div className="mt-6 sm:mt-10 border-t border-border pt-6 sm:pt-8">
                <div className="mb-5 sm:mb-6 flex items-center gap-3">
                  <Award className="size-5 sm:size-6 text-primary" />
                  <Badge variant={valid ? "success" : "error"} className="rounded-none uppercase tracking-wider text-[10px] sm:text-xs">
                    {certificate.status}
                  </Badge>
                </div>
                <dl className="grid gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Recipient
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base font-semibold">
                      {certificate.user.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Course
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base font-semibold">
                      {certificate.course.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Certificate ID
                    </dt>
                    <dd className="mt-1 font-mono text-xs sm:text-sm text-foreground">
                      {certificate.certificateId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Issuer
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-foreground">
                      {certificate.issuer?.name ?? "Darion Technologies"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Issue date
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-foreground">
                      {certificate.issuedAt?.toLocaleDateString("en-US", {
                        dateStyle: "long",
                      }) ?? "Not issued"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Completion date
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-foreground">
                      {certificate.enrollment.completedAt?.toLocaleDateString(
                        "en-US",
                        { dateStyle: "long" }
                      ) ?? "Not recorded"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                      Score
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-foreground">
                      {certificate.score == null
                        ? "Not applicable"
                        : `${certificate.score}%`}
                    </dd>
                  </div>
                </dl>

                {revoked && (
                  <div className="mt-6 sm:mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-800 rounded-none">
                    <b>Revocation reason:</b>{" "}
                    {certificate.revokedReason ?? "Administrative revocation."}
                    {certificate.replacements.length > 0 && (
                      <p className="mt-2 text-red-700 font-medium">
                        A replacement credential has been issued.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
