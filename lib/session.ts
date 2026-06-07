import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type JwtPayload = { session_id?: string };

function decodeJwtPayload(token: string): JwtPayload {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
  } catch {
    return {};
  }
}

function parseUserAgent(value: string) {
  const browser = value.includes("Edg/") ? "Edge" : value.includes("Chrome/") ? "Chrome" : value.includes("Firefox/") ? "Firefox" : value.includes("Safari/") ? "Safari" : "Unknown";
  const operatingSystem = value.includes("Windows") ? "Windows" : value.includes("Mac OS") ? "macOS" : value.includes("Android") ? "Android" : value.includes("iPhone") || value.includes("iPad") ? "iOS" : value.includes("Linux") ? "Linux" : "Unknown";
  const device = /Android|iPhone|iPad|Mobile/i.test(value) ? "Mobile" : "Desktop";
  return { browser, operatingSystem, device };
}

export function sessionIdFromToken(accessToken: string) {
  return decodeJwtPayload(accessToken).session_id ?? null;
}

export async function recordSession(userId: string, accessToken: string) {
  const sessionId = sessionIdFromToken(accessToken);
  if (!sessionId) return;
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = forwarded
    ? createHash("sha256").update(`${forwarded}:${process.env.SESSION_HASH_SALT ?? "darion-academy"}`).digest("hex")
    : null;
  const parsed = parseUserAgent(userAgent);
  await prisma.userSession.upsert({
    where: { sessionId },
    update: { ...parsed, ipHash, revokedAt: null },
    create: { userId, sessionId, ...parsed, ipHash },
  });
}

export async function syncCurrentSession(userId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) await recordSession(userId, session.access_token);
}
