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
  return <main className="min-h-screen bg-muted p-5 sm:p-10"><div className="mx-auto max-w-3xl"><Brand /><Card className="mt-10"><CardContent className="p-8 sm:p-12">
    <div className="flex items-start gap-5">
      <span className={`p-4 ${valid ? "bg-emerald-50 text-emerald-700" : revoked ? "bg-red-50 text-red-700" : "bg-muted text-muted-foreground"}`}>
        {valid ? <CheckCircle2 className="size-9" /> : revoked ? <Ban className="size-9" /> : <SearchX className="size-9" />}
      </span>
      <div><p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Credential verification</p><h1 className="mt-2 text-3xl font-bold">{valid ? "Valid certificate" : revoked ? "Revoked certificate" : "Certificate not valid"}</h1>
      <p className="mt-2 text-muted-foreground">{valid ? "This credential was issued by Darion Technologies." : revoked ? "This credential is no longer valid." : "No issued credential matches this ID."}</p></div>
    </div>
    {certificate && (valid || revoked) && <div className="mt-10 border-t pt-8"><div className="mb-6 flex items-center gap-3"><Award className="size-6 text-blue-700" /><Badge>{certificate.status}</Badge></div><dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Recipient</dt><dd className="mt-1 font-semibold">{certificate.user.name}</dd></div>
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Course</dt><dd className="mt-1 font-semibold">{certificate.course.title}</dd></div>
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Certificate ID</dt><dd className="mt-1 font-mono text-sm">{certificate.certificateId}</dd></div>
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Issuer</dt><dd className="mt-1">{certificate.issuer?.name ?? "Darion Technologies"}</dd></div>
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Issue date</dt><dd className="mt-1">{certificate.issuedAt?.toLocaleDateString("en-US", { dateStyle: "long" }) ?? "Not issued"}</dd></div>
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Completion date</dt><dd className="mt-1">{certificate.enrollment.completedAt?.toLocaleDateString("en-US", { dateStyle: "long" }) ?? "Not recorded"}</dd></div>
      <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Score</dt><dd className="mt-1">{certificate.score == null ? "Not applicable" : `${certificate.score}%`}</dd></div>
    </dl>{revoked && <div className="mt-7 border border-red-200 bg-red-50 p-4 text-sm text-red-800"><b>Revocation reason:</b> {certificate.revokedReason ?? "Administrative revocation."}{certificate.replacements.length > 0 && <p className="mt-2">A replacement credential has been issued.</p>}</div>}</div>}
  </CardContent></Card></div></main>;
}
