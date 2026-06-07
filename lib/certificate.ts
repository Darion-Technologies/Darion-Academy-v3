import chromium from "@sparticuz/chromium";
import QRCode from "qrcode";
import puppeteer from "puppeteer-core";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export type CertificateTemplateSnapshot = {
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFontFamily: string;
  borderStyle: string;
  borderWidth: number;
  textAlign: string;
  title: string;
  presentationText: string;
  completionText: string;
  showScore: boolean;
  showCompletionDate: boolean;
  showCertificateId: boolean;
  showQrCode: boolean;
  signerName: string | null;
  signerTitle: string | null;
  logoUrl: string | null;
  signatureUrl: string | null;
  backgroundUrl: string | null;
};

export const corporateTemplate: CertificateTemplateSnapshot = {
  name: "Corporate",
  primaryColor: "#143c72",
  accentColor: "#1764c0",
  backgroundColor: "#f7f9fc",
  textColor: "#10213b",
  fontFamily: "Arial",
  headingFontFamily: "Georgia",
  borderStyle: "DOUBLE",
  borderWidth: 2,
  textAlign: "CENTER",
  title: "Certificate of Completion",
  presentationText: "This certificate is proudly presented to",
  completionText: "for successfully completing",
  showScore: true,
  showCompletionDate: true,
  showCertificateId: true,
  showQrCode: true,
  signerName: null,
  signerTitle: null,
  logoUrl: null,
  signatureUrl: null,
  backgroundUrl: null,
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!);
}

function safeCssValue(value: string) {
  return value.replace(/[;{}<>]/g, "");
}

export function snapshotTemplate(template: Partial<CertificateTemplateSnapshot>): CertificateTemplateSnapshot {
  return {
    name: template.name ?? corporateTemplate.name,
    primaryColor: template.primaryColor ?? corporateTemplate.primaryColor,
    accentColor: template.accentColor ?? corporateTemplate.accentColor,
    backgroundColor: template.backgroundColor ?? corporateTemplate.backgroundColor,
    textColor: template.textColor ?? corporateTemplate.textColor,
    fontFamily: template.fontFamily ?? corporateTemplate.fontFamily,
    headingFontFamily: template.headingFontFamily ?? corporateTemplate.headingFontFamily,
    borderStyle: template.borderStyle ?? corporateTemplate.borderStyle,
    borderWidth: template.borderWidth ?? corporateTemplate.borderWidth,
    textAlign: template.textAlign ?? corporateTemplate.textAlign,
    title: template.title ?? corporateTemplate.title,
    presentationText: template.presentationText ?? corporateTemplate.presentationText,
    completionText: template.completionText ?? corporateTemplate.completionText,
    showScore: template.showScore ?? corporateTemplate.showScore,
    showCompletionDate: template.showCompletionDate ?? corporateTemplate.showCompletionDate,
    showCertificateId: template.showCertificateId ?? corporateTemplate.showCertificateId,
    showQrCode: template.showQrCode ?? corporateTemplate.showQrCode,
    signerName: template.signerName ?? corporateTemplate.signerName,
    signerTitle: template.signerTitle ?? corporateTemplate.signerTitle,
    logoUrl: template.logoUrl ?? corporateTemplate.logoUrl,
    signatureUrl: template.signatureUrl ?? corporateTemplate.signatureUrl,
    backgroundUrl: template.backgroundUrl ?? corporateTemplate.backgroundUrl,
  };
}

export async function ensureDefaultCertificateTemplate() {
  const existing = await prisma.certificateTemplate.findFirst({
    where: { isDefault: true },
  });
  if (existing) return existing;
  return prisma.certificateTemplate.upsert({
    where: { name: corporateTemplate.name },
    update: { isDefault: true, status: "ACTIVE" },
    create: { ...corporateTemplate, isDefault: true, status: "ACTIVE" },
  });
}

async function resolveAssetUrl(path: string | null) {
  if (!path) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("certificates").createSignedUrl(path, 600);
  return error ? null : data.signedUrl;
}

export async function calculateCertificateScore(userId: string, courseId: string) {
  const quizzes = await prisma.quiz.findMany({
    where: { lesson: { completionRequired: true, module: { courseId } } },
    select: { id: true },
  });
  if (!quizzes.length) return null;
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, quizId: { in: quizzes.map((quiz) => quiz.id) }, submittedAt: { not: null } },
    orderBy: { score: "desc" },
    select: { quizId: true, score: true },
  });
  return averageHighestQuizScores(quizzes.map((quiz) => quiz.id), attempts);
}

export function averageHighestQuizScores(
  requiredQuizIds: string[],
  attempts: { quizId: string; score: number }[],
) {
  if (!requiredQuizIds.length) return null;
  const highest = new Map<string, number>();
  attempts.forEach((attempt) => {
    highest.set(attempt.quizId, Math.max(highest.get(attempt.quizId) ?? 0, attempt.score));
  });
  if (requiredQuizIds.some((quizId) => !highest.has(quizId))) return null;
  return Math.round(requiredQuizIds.reduce((sum, quizId) => sum + highest.get(quizId)!, 0) / requiredQuizIds.length);
}

export function certificateHtml(input: {
  recipient: string;
  course: string;
  completionDate: string;
  issueDate: string;
  issuer: string;
  score?: number | null;
  certificateId: string;
  verificationUrl: string;
  qrDataUrl?: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  backgroundUrl?: string | null;
  template: CertificateTemplateSnapshot;
}) {
  const template = snapshotTemplate(input.template);
  const alignment = ["LEFT", "RIGHT"].includes(template.textAlign) ? template.textAlign.toLowerCase() : "center";
  const borderStyle = template.borderStyle === "NONE" ? "none" : template.borderStyle === "SINGLE" ? "solid" : "double";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font-family:${safeCssValue(template.fontFamily)},Arial,sans-serif;color:${safeCssValue(template.textColor)}}
  .page{width:297mm;height:210mm;padding:12mm;background:${safeCssValue(template.backgroundColor)} ${input.backgroundUrl ? `url("${escapeHtml(input.backgroundUrl)}") center/cover no-repeat` : ""}}
  .frame{height:100%;border:${template.borderWidth}px ${borderStyle} ${safeCssValue(template.primaryColor)};padding:9mm}
  .inner{height:100%;display:flex;flex-direction:column;align-items:${alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center"};justify-content:center;text-align:${alignment};padding:12mm}
  .logo{max-width:150px;max-height:58px;object-fit:contain}.mark{width:54px;height:54px;background:${safeCssValue(template.accentColor)};color:#fff;display:grid;place-items:center;font-weight:800;font-size:25px}
  .company{margin-top:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-size:12px}.title{font-family:${safeCssValue(template.headingFontFamily)},Georgia,serif;font-size:45px;margin:18px 0 8px}
  .sub{font-size:15px;color:${safeCssValue(template.textColor)};opacity:.72}.name{font-family:${safeCssValue(template.headingFontFamily)},Georgia,serif;font-size:37px;color:${safeCssValue(template.accentColor)};margin:16px 0;border-bottom:1px solid ${safeCssValue(template.primaryColor)};padding:0 36px 8px}
  .course{font-size:24px;font-weight:700;margin:11px}.footer{display:flex;align-items:flex-end;gap:38px;margin-top:28px}.meta{display:flex;gap:38px;font-size:11px}.meta b{display:block;font-size:13px;margin-bottom:5px}
  .signature{width:190px;border-top:1px solid ${safeCssValue(template.textColor)};padding-top:6px;font-size:11px}.signature img{display:block;max-width:150px;max-height:42px;margin:0 auto 4px}
  .qr{width:72px;height:72px}.verify{font-size:8px;max-width:110px;overflow-wrap:anywhere}
  </style></head><body><div class="page"><div class="frame"><div class="inner">
  ${input.logoUrl ? `<img class="logo" src="${escapeHtml(input.logoUrl)}">` : `<div class="mark">D</div><div class="company">Darion Technologies</div>`}
  <div class="title">${escapeHtml(template.title)}</div><div class="sub">${escapeHtml(template.presentationText)}</div>
  <div class="name">${escapeHtml(input.recipient)}</div><div class="sub">${escapeHtml(template.completionText)}</div><div class="course">${escapeHtml(input.course)}</div>
  <div class="footer"><div class="meta">
  ${template.showCompletionDate ? `<div><b>${escapeHtml(input.completionDate)}</b>Completion date</div>` : ""}
  ${template.showScore && input.score != null ? `<div><b>${input.score}%</b>Final score</div>` : ""}
  <div><b>${escapeHtml(input.issueDate)}</b>Issue date</div>
  ${template.showCertificateId ? `<div><b>${escapeHtml(input.certificateId)}</b>Certificate ID</div>` : ""}
  </div>
  ${(template.signerName || input.signatureUrl) ? `<div class="signature">${input.signatureUrl ? `<img src="${escapeHtml(input.signatureUrl)}">` : ""}<b>${escapeHtml(template.signerName ?? input.issuer)}</b><br>${escapeHtml(template.signerTitle ?? "Authorized issuer")}</div>` : ""}
  ${template.showQrCode && input.qrDataUrl ? `<div><img class="qr" src="${input.qrDataUrl}"><div class="verify">${escapeHtml(input.verificationUrl)}</div></div>` : ""}
  </div></div></div></div></body></html>`;
}

export async function renderCertificatePdf(html: string) {
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath());
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1123, height: 794 },
    executablePath,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    return Buffer.from(await page.pdf({ format: "A4", landscape: true, printBackground: true }));
  } finally {
    await browser.close();
  }
}

function createCertificateId() {
  return `DA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function issueCertificate(input: {
  enrollmentId: string;
  issuerId?: string | null;
  certificateDbId?: string;
  replacesId?: string | null;
}) {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id: input.enrollmentId },
    include: {
      learner: true,
      course: { include: { certificateTemplate: true } },
    },
  });
  if (enrollment.status !== "COMPLETED") throw new Error("Course completion must be approved before issuing a certificate.");

  const templateRecord = enrollment.course.certificateTemplate?.status === "ACTIVE"
    ? enrollment.course.certificateTemplate
    : await ensureDefaultCertificateTemplate();
  const template = snapshotTemplate(templateRecord);
  const score = await calculateCertificateScore(enrollment.learnerId, enrollment.courseId);
  const certificate = input.certificateDbId
    ? await prisma.certificate.update({
        where: { id: input.certificateDbId },
        data: {
          status: "ISSUING",
          failureReason: null,
          issuerId: input.issuerId,
          templateId: templateRecord.id,
          templateSnapshot: template as unknown as Prisma.InputJsonValue,
          score,
        },
      })
    : await prisma.certificate.create({
        data: {
          certificateId: createCertificateId(),
          enrollmentId: enrollment.id,
          userId: enrollment.learnerId,
          courseId: enrollment.courseId,
          templateId: templateRecord.id,
          issuerId: input.issuerId,
          replacesId: input.replacesId,
          status: "ISSUING",
          score,
          templateSnapshot: template as unknown as Prisma.InputJsonValue,
        },
      });

  try {
    const issuer = input.issuerId
      ? await prisma.user.findUnique({ where: { id: input.issuerId }, select: { name: true } })
      : null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${certificate.certificateId}`;
    const [qrDataUrl, logoUrl, signatureUrl, backgroundUrl] = await Promise.all([
      template.showQrCode ? QRCode.toDataURL(verificationUrl, { margin: 0, width: 180 }) : null,
      resolveAssetUrl(template.logoUrl),
      resolveAssetUrl(template.signatureUrl),
      resolveAssetUrl(template.backgroundUrl),
    ]);
    const now = new Date();
    const pdf = await renderCertificatePdf(certificateHtml({
      recipient: enrollment.learner.name,
      course: enrollment.course.title,
      completionDate: (enrollment.completedAt ?? now).toLocaleDateString("en-US", { dateStyle: "long" }),
      issueDate: now.toLocaleDateString("en-US", { dateStyle: "long" }),
      issuer: issuer?.name ?? "Darion Technologies",
      score,
      certificateId: certificate.certificateId,
      verificationUrl,
      qrDataUrl,
      logoUrl,
      signatureUrl,
      backgroundUrl,
      template,
    }));
    const path = `${certificate.userId}/${certificate.certificateId}.pdf`;
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from("certificates").upload(path, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (error) throw error;
    return await prisma.$transaction(async (tx) => {
      const generated = await tx.certificate.update({
        where: { id: certificate.id },
        data: { fileUrl: path, status: "GENERATED", issuedAt: now, failureReason: null },
      });
      await tx.notification.create({
        data: {
          userId: certificate.userId,
          type: "CERTIFICATE_GENERATED",
          title: "Certificate ready",
          message: `Your ${enrollment.course.title} certificate is ready.`,
          href: "/certificates",
        },
      });
      await tx.activityLog.create({
        data: {
          actorId: input.issuerId,
          action: input.replacesId ? "Reissued certificate" : "Issued certificate",
          entityType: "Certificate",
          entityId: certificate.id,
          metadata: { certificateId: certificate.certificateId },
        },
      });
      return generated;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Certificate generation failed.";
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { status: "FAILED", failureReason: message.slice(0, 1000) },
    });
    throw error;
  }
}
