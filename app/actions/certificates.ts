"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";
import { requireRole } from "@/lib/auth";
import { corporateTemplate, issueCertificate } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";
import { uploadPrivateFile } from "@/lib/storage";

export type CertificateActionState = { error?: string; success?: string };

const colorPattern = /^#[0-9a-fA-F]{6}$/;
const allowedFonts = ["Arial", "Georgia", "Helvetica", "Times New Roman", "Verdana"];

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

export async function saveCertificateTemplateAction(
  _state: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  await requireRole("ADMIN");
  const id = text(formData, "id") || undefined;
  const name = text(formData, "name");
  const colors = ["primaryColor", "accentColor", "backgroundColor", "textColor"] as const;
  const colorValues = Object.fromEntries(colors.map((key) => [key, text(formData, key)]));
  if (name.length < 2) return { error: "Template name is required." };
  if (colors.some((key) => !colorPattern.test(colorValues[key]))) return { error: "Use six-digit hex colors." };
  const fontFamily = text(formData, "fontFamily", corporateTemplate.fontFamily);
  const headingFontFamily = text(formData, "headingFontFamily", corporateTemplate.headingFontFamily);
  if (!allowedFonts.includes(fontFamily) || !allowedFonts.includes(headingFontFamily)) return { error: "Select an approved font." };

  try {
    const template = id
      ? await prisma.certificateTemplate.update({
          where: { id },
          data: {
            name,
            ...colorValues,
            fontFamily,
            headingFontFamily,
            borderStyle: text(formData, "borderStyle", "DOUBLE"),
            borderWidth: Math.min(8, Math.max(0, Number(formData.get("borderWidth") ?? 2))),
            textAlign: text(formData, "textAlign", "CENTER"),
            title: text(formData, "title", corporateTemplate.title),
            presentationText: text(formData, "presentationText", corporateTemplate.presentationText),
            completionText: text(formData, "completionText", corporateTemplate.completionText),
            showScore: formData.get("showScore") === "on",
            showCompletionDate: formData.get("showCompletionDate") === "on",
            showCertificateId: formData.get("showCertificateId") === "on",
            showQrCode: formData.get("showQrCode") === "on",
            signerName: text(formData, "signerName") || null,
            signerTitle: text(formData, "signerTitle") || null,
          },
        })
      : await prisma.certificateTemplate.create({
          data: {
            name,
            ...colorValues,
            fontFamily,
            headingFontFamily,
            borderStyle: text(formData, "borderStyle", "DOUBLE"),
            borderWidth: Math.min(8, Math.max(0, Number(formData.get("borderWidth") ?? 2))),
            textAlign: text(formData, "textAlign", "CENTER"),
            title: text(formData, "title", corporateTemplate.title),
            presentationText: text(formData, "presentationText", corporateTemplate.presentationText),
            completionText: text(formData, "completionText", corporateTemplate.completionText),
            showScore: formData.get("showScore") === "on",
            showCompletionDate: formData.get("showCompletionDate") === "on",
            showCertificateId: formData.get("showCertificateId") === "on",
            showQrCode: formData.get("showQrCode") === "on",
            signerName: text(formData, "signerName") || null,
            signerTitle: text(formData, "signerTitle") || null,
          },
        });

    const assetUpdates: { logoUrl?: string; signatureUrl?: string; backgroundUrl?: string } = {};
    for (const [field, formKey] of [
      ["logoUrl", "logo"],
      ["signatureUrl", "signature"],
      ["backgroundUrl", "background"],
    ] as const) {
      const file = formData.get(formKey);
      if (file instanceof File && file.size > 0) {
        assetUpdates[field] = await uploadPrivateFile(
          "certificates",
          `templates/${template.id}/${field}-${Date.now()}-${file.name}`,
          file,
        );
      }
    }
    if (Object.keys(assetUpdates).length) {
      await prisma.certificateTemplate.update({ where: { id: template.id }, data: assetUpdates });
    }
    revalidatePath("/admin/certificate-templates");
    revalidatePath(`/admin/certificate-templates/${template.id}`);
    return { success: "Certificate template saved." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A template with this name already exists." };
    }
    return { error: "The certificate template could not be saved." };
  }
}

export async function setDefaultTemplateAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = text(formData, "id");
  await prisma.$transaction([
    prisma.certificateTemplate.updateMany({ data: { isDefault: false } }),
    prisma.certificateTemplate.update({ where: { id }, data: { isDefault: true, status: "ACTIVE" } }),
  ]);
  revalidatePath("/admin/certificate-templates");
}

export async function toggleTemplateStatusAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = text(formData, "id");
  const template = await prisma.certificateTemplate.findUniqueOrThrow({ where: { id } });
  if (template.isDefault && template.status === "ACTIVE") throw new Error("The default template cannot be deactivated.");
  await prisma.certificateTemplate.update({
    where: { id },
    data: { status: template.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/admin/certificate-templates");
}

export async function duplicateTemplateAction(formData: FormData) {
  await requireRole("ADMIN");
  const source = await prisma.certificateTemplate.findUniqueOrThrow({ where: { id: text(formData, "id") } });
  await prisma.certificateTemplate.create({
    data: {
      name: `${source.name} Copy ${Date.now().toString().slice(-4)}`,
      status: source.status,
      isDefault: false,
      primaryColor: source.primaryColor,
      accentColor: source.accentColor,
      backgroundColor: source.backgroundColor,
      textColor: source.textColor,
      fontFamily: source.fontFamily,
      headingFontFamily: source.headingFontFamily,
      borderStyle: source.borderStyle,
      borderWidth: source.borderWidth,
      textAlign: source.textAlign,
      title: source.title,
      presentationText: source.presentationText,
      completionText: source.completionText,
      showScore: source.showScore,
      showCompletionDate: source.showCompletionDate,
      showCertificateId: source.showCertificateId,
      showQrCode: source.showQrCode,
      signerName: source.signerName,
      signerTitle: source.signerTitle,
      logoUrl: source.logoUrl,
      signatureUrl: source.signatureUrl,
      backgroundUrl: source.backgroundUrl,
    },
  });
  revalidatePath("/admin/certificate-templates");
}

export async function assignCourseTemplateAction(formData: FormData) {
  await requireRole("ADMIN");
  const courseId = text(formData, "courseId");
  const templateId = text(formData, "templateId") || null;
  if (templateId) {
    const template = await prisma.certificateTemplate.findUniqueOrThrow({ where: { id: templateId } });
    if (template.status !== "ACTIVE") throw new Error("Select an active certificate template.");
  }
  await prisma.course.update({ where: { id: courseId }, data: { certificateTemplateId: templateId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function retryCertificateAction(
  _state: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  const admin = await requireRole("ADMIN");
  const certificate = await prisma.certificate.findUniqueOrThrow({ where: { id: text(formData, "id") } });
  if (certificate.status !== "FAILED") return { error: "Only failed certificate generation can be retried." };
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: certificate.enrollmentId } });
  if (enrollment.status !== "COMPLETED") return { error: "Approve course completion before retrying certificate generation." };
  try {
    await issueCertificate({ enrollmentId: certificate.enrollmentId, issuerId: admin.id, certificateDbId: certificate.id });
    revalidatePath("/admin/certificates");
    revalidatePath("/certificates");
    return { success: "Certificate generated successfully." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Certificate generation failed." };
  }
}

export async function approveAndIssueCertificateAction(
  _state: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  const admin = await requireRole("ADMIN");
  const certificate = await prisma.certificate.findUniqueOrThrow({
    where: { id: text(formData, "id") },
    include: { enrollment: true },
  });
  if (certificate.enrollment.progressPercent !== 100) {
    return { error: "The learner has not completed all course requirements." };
  }
  if (certificate.status === "GENERATED" || certificate.status === "REVOKED") {
    return { error: "This certificate cannot be approved and issued." };
  }
  await prisma.enrollment.update({
    where: { id: certificate.enrollmentId },
    data: {
      status: "COMPLETED",
      approvedAt: certificate.enrollment.approvedAt ?? new Date(),
      completedAt: certificate.enrollment.completedAt ?? new Date(),
    },
  });
  try {
    await issueCertificate({
      enrollmentId: certificate.enrollmentId,
      issuerId: admin.id,
      certificateDbId: certificate.id,
    });
    revalidatePath("/admin/certificates");
    revalidatePath("/certificates");
    return { success: "Completion approved and certificate issued." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Completion was approved, but certificate generation failed. Use Retry." };
  }
}

export async function revokeCertificateAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = text(formData, "id");
  const reason = text(formData, "reason");
  if (reason.length < 5) throw new Error("A revocation reason is required.");
  await prisma.$transaction([
    prisma.certificate.update({
      where: { id },
      data: { status: "REVOKED", revokedReason: reason, revokedAt: new Date(), revokedById: admin.id },
    }),
    prisma.activityLog.create({
      data: { actorId: admin.id, action: "Revoked certificate", entityType: "Certificate", entityId: id, metadata: { reason } },
    }),
  ]);
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
}

export async function reissueCertificateAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = text(formData, "id");
  const reason = text(formData, "reason");
  if (reason.length < 5) throw new Error("A reissue reason is required.");
  const old = await prisma.certificate.findUniqueOrThrow({ where: { id } });
  if (old.status !== "REVOKED") {
    await prisma.certificate.update({
      where: { id },
      data: { status: "REVOKED", revokedReason: reason, revokedAt: new Date(), revokedById: admin.id },
    });
  }
  await issueCertificate({ enrollmentId: old.enrollmentId, issuerId: admin.id, replacesId: old.id });
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
}
