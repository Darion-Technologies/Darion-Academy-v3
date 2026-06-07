import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { issueCertificate } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  let certificate = await prisma.certificate.findUnique({ where: { id } });
  if (!certificate || (user.role !== "ADMIN" && certificate.userId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (certificate.status === "ELIGIBLE") {
    try {
      certificate = await issueCertificate({
        enrollmentId: certificate.enrollmentId,
        issuerId: user.role === "ADMIN" ? user.id : null,
        certificateDbId: certificate.id,
      });
    } catch {
      return NextResponse.json({ error: "Certificate generation failed. An administrator can retry it." }, { status: 500 });
    }
  }
  if (certificate.status === "REVOKED") return NextResponse.json({ error: "This certificate has been revoked." }, { status: 410 });
  if (certificate.status !== "GENERATED" || !certificate.fileUrl) {
    return NextResponse.json({ error: certificate.failureReason ?? "Certificate is not ready." }, { status: 409 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("certificates").createSignedUrl(certificate.fileUrl, 3600);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
