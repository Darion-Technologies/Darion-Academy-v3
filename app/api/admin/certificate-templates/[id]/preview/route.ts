import QRCode from "qrcode";
import { requireRole } from "@/lib/auth";
import { certificateHtml, renderCertificatePdf, snapshotTemplate } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const template = await prisma.certificateTemplate.findUnique({ where: { id } });
  if (!template) return new Response("Template not found", { status: 404 });
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify/DA-2026-PREVIEW`;
  const qrDataUrl = template.showQrCode ? await QRCode.toDataURL(verificationUrl, { margin: 0, width: 180 }) : null;
  const pdf = await renderCertificatePdf(certificateHtml({
    recipient: "Alex Morgan",
    course: "Secure Web Application Foundations",
    completionDate: "June 6, 2026",
    issueDate: "June 6, 2026",
    issuer: template.signerName ?? "Darion Technologies",
    score: 92,
    certificateId: "DA-2026-PREVIEW",
    verificationUrl,
    qrDataUrl,
    template: snapshotTemplate(template),
  }));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${template.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-preview.pdf"`,
    },
  });
}
