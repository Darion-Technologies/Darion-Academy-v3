import Link from "next/link";
import { duplicateTemplateAction, setDefaultTemplateAction, toggleTemplateStatusAction } from "@/app/actions/certificates";
import { CertificateTemplateEditor } from "@/components/admin/certificate-template-editor";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { corporateTemplate, ensureDefaultCertificateTemplate } from "@/lib/certificate";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CertificateTemplatesPage() {
  await requireRole("ADMIN");
  await ensureDefaultCertificateTemplate();
  const templates = await prisma.certificateTemplate.findMany({ include: { _count: { select: { courses: true, certificates: true } } }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
  return <><PageHeader title="Certificate templates" description="Create reliable branded certificate layouts with live and PDF previews." /><div className="mb-8"><CertificateTemplateEditor initial={corporateTemplate} /></div><div className="grid gap-4 md:grid-cols-2">{templates.map((template)=><Card key={template.id}><CardHeader><div className="flex justify-between gap-3"><CardTitle>{template.name}</CardTitle><div className="flex gap-2"><Badge>{template.status}</Badge>{template.isDefault && <Badge className="bg-blue-100 text-blue-700">DEFAULT</Badge>}</div></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{template._count.courses} courses · {template._count.certificates} issued records</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link href={`/admin/certificate-templates/${template.id}`}>Edit</Link></Button><form action={duplicateTemplateAction}><input type="hidden" name="id" value={template.id}/><SubmitButton size="sm" variant="outline" pendingText="Duplicating...">Duplicate</SubmitButton></form>{!template.isDefault && <form action={setDefaultTemplateAction}><input type="hidden" name="id" value={template.id}/><SubmitButton size="sm" variant="outline" pendingText="Updating...">Make default</SubmitButton></form>}<form action={toggleTemplateStatusAction}><input type="hidden" name="id" value={template.id}/><SubmitButton size="sm" variant="ghost" pendingText="Updating...">{template.status === "ACTIVE" ? "Deactivate" : "Activate"}</SubmitButton></form></div></CardContent></Card>)}</div></>;
}
