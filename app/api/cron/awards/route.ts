import { NextRequest, NextResponse } from "next/server";
import { awardPeriodicBadge } from "@/lib/badges";
import { BadgeType } from "@/generated/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Basic security: In production, verify the Vercel CRON secret headers
    // For manual triggers, we verify admin access.
    const authHeader = req.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCron) {
      await requireRole("ADMIN"); // Throw 403 if not admin
    }

    const { type, period } = await req.json();

    if (!type || !period) {
      return NextResponse.json({ error: "Missing type or period" }, { status: 400 });
    }

    const result = await awardPeriodicBadge(type as BadgeType, period);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Award Badge Error:", error);
    return NextResponse.json({ error: error.message || "Failed to award badge" }, { status: 500 });
  }
}
