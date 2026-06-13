import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    include: { learner: true, course: true },
    orderBy: { progressPercent: "desc" }
  });

  // Generate CSV
  const header = ["Learner Name", "Employee ID", "Department", "Course Title", "Status", "Progress %", "Assigned Date"].join(",");
  const rows = enrollments.map(e => {
    return [
      `"${e.learner.name}"`,
      `"${e.learner.employeeId || ""}"`,
      `"${e.learner.department || ""}"`,
      `"${e.course.title}"`,
      `"${e.status}"`,
      e.progressPercent,
      `"${e.assignedAt.toISOString()}"`
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="academy-report-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}
