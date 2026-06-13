import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Create a rate limiter that allows 5 requests per 10 seconds per IP
export const authRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/auth",
    })
  : null;

/**
 * Helper function to enforce rate limits.
 * @param identifier Usually the client IP address or user ID.
 * @returns { success: boolean, reset: number }
 */
export async function enforceRateLimit(identifier: string) {
  if (!authRateLimit) return { success: true }; // Fallback if no Redis configured
  
  try {
    const { success, reset } = await authRateLimit.limit(identifier);
    return { success, reset };
  } catch (error) {
    console.error("Rate Limiting Error:", error);
    return { success: true }; // Fail open so users aren't locked out if Redis crashes
  }
}
