import { notFound } from "next/navigation";
import { CertificateTemplateEditor } from "@/components/admin/certificate-template-editor";
import { PageHeader } from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditCertificateTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN"); const { id } = await params;
  const template = await prisma.certificateTemplate.findUnique({ where: { id } });
  if (!template) notFound();
  return <><PageHeader title={template.name} description="Edits affect future certificates only; issued certificates keep their snapshots." /><CertificateTemplateEditor initial={template} /></>;
}
