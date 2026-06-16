import { reissueCertificateAction, revokeCertificateAction } from "@/app/actions/certificates";
import { CertificateIssueAction } from "@/components/admin/certificate-issue-action";
import { CertificateButton } from "@/components/certificate-button";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCertificatesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("ADMIN");
  const { status } = await searchParams;
  const allowed = ["ELIGIBLE","ISSUING","GENERATED","FAILED","REVOKED"];
  const certificates = await prisma.certificate.findMany({
    where: allowed.includes(status ?? "") ? { status: status as "GENERATED" } : {},
    include: { user: true, course: true, enrollment: true, issuer: true, template: true, replaces: true },
    orderBy: { createdAt: "desc" },
  });
  return <><PageHeader title="Certificate administration" description="Monitor issuance, retry failures, and preserve correction history." action={<div className="flex gap-2">{["ALL",...allowed].map((item)=><a key={item} href={item==="ALL"?"/admin/certificates":`/admin/certificates?status=${item}`} className="border bg-card px-3 py-2 text-xs font-semibold">{item}</a>)}</div>} /><Card><Table><TableHeader><TableRow><TableHead>Credential</TableHead><TableHead>Learner</TableHead><TableHead>Status</TableHead><TableHead>Issued</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{certificates.map((certificate)=><TableRow key={certificate.id}><TableCell><p className="font-mono text-xs">{certificate.certificateId}</p><p className="mt-1 text-xs text-muted-foreground">{certificate.course.title}</p>{certificate.replaces && <p className="text-xs text-amber-700">Replaces {certificate.replaces.certificateId}</p>}</TableCell><TableCell>{certificate.user.name}<p className="text-xs text-muted-foreground">{certificate.template?.name ?? "Snapshot/default"}</p><p className="text-xs text-muted-foreground">{certificate.enrollment.progressPercent}% · {certificate.enrollment.status.replaceAll("_"," ")}</p></TableCell><TableCell><Badge className={certificate.status==="FAILED"?"bg-red-50 text-red-700":certificate.status==="GENERATED"?"bg-emerald-50 text-emerald-700":""}>{certificate.status}</Badge>{certificate.failureReason && <p className="mt-1 max-w-52 text-xs text-red-600">{certificate.failureReason}</p>}</TableCell><TableCell>{certificate.issuedAt?.toLocaleDateString() ?? "-"}<p className="text-xs text-muted-foreground">{certificate.issuer?.name ?? "System"}</p></TableCell><TableCell><div className="flex max-w-sm flex-wrap gap-2">{certificate.status==="GENERATED" && <CertificateButton id={certificate.id} />}{certificate.status==="FAILED" && certificate.enrollment.status==="COMPLETED" && <CertificateIssueAction id={certificate.id} mode="retry" />}{["ELIGIBLE","FAILED"].includes(certificate.status) && certificate.enrollment.status!=="COMPLETED" && certificate.enrollment.progressPercent===100 && <CertificateIssueAction id={certificate.id} mode="approve" />}{certificate.status!=="REVOKED" && <form action={revokeCertificateAction} className="flex"><input type="hidden" name="id" value={certificate.id}/><Input className="h-8 w-40" name="reason" placeholder="Revocation reason" required/><SubmitButton size="sm" variant="destructive" pendingText="Revoking...">Revoke</SubmitButton></form>}{certificate.status==="REVOKED" && <form action={reissueCertificateAction} className="flex"><input type="hidden" name="id" value={certificate.id}/><Input className="h-8 w-40" name="reason" placeholder="Reissue reason" required/><SubmitButton size="sm" pendingText="Reissuing...">Reissue</SubmitButton></form>}</div></TableCell></TableRow>)}</TableBody></Table></Card></>;
}
