import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
if (typeof globalThis !== "undefined") {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000);
  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

// Cache of Upstash Ratelimit instances for different configs
const ratelimitInstances = new Map<string, Ratelimit>();

function getRatelimitInstance(config: RateLimitConfig): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const cacheKey = `${config.maxRequests}:${config.windowSeconds}`;
  if (!ratelimitInstances.has(cacheKey)) {
    try {
      const redis = new Redis({ url, token });
      ratelimitInstances.set(
        cacheKey,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
          analytics: true,
          prefix: "@meuqr/ratelimit",
        })
      );
    } catch (err) {
      console.error("Failed to initialize Upstash Redis:", err);
      return null;
    }
  }
  return ratelimitInstances.get(cacheKey) || null;
}

function checkInMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + windowMs,
      limit: config.maxRequests,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit: config.maxRequests,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
    limit: config.maxRequests,
  };
}

/**
 * Check if a request should be rate limited based on a unique key (e.g., IP address).
 * Returns the rate limit status with remaining requests and reset time.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }
): Promise<RateLimitResult> {
  const ratelimit = getRatelimitInstance(config);

  if (ratelimit) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(key);
      return {
        allowed: success,
        remaining,
        resetAt: reset,
        limit,
      };
    } catch (error) {
      console.error("Upstash Redis rate limit error, falling back to in-memory:", error);
    }
  }

  return checkInMemoryRateLimit(key, config);
}

/**
 * Extract a client IP from the request headers, falling back to a placeholder.
 * Checks trusted x-vercel-forwarded-for first, then NextRequest's .ip, and only then fallbacks.
 */
export function getClientIp(request: Request): string {
  // 1. Try Vercel's proprietary header (cannot be spoofed on Vercel)
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  // 2. Try the NextRequest ip property (populated by Vercel/Next.js platforms)
  const nextIp = (request as any).ip;
  if (nextIp) return nextIp;

  // 3. Fallback to standard x-forwarded-for or x-real-ip
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Standard rate limit configs for different endpoint types.
 */
export const RATE_LIMIT_CONFIGS = {
  /** Public analytics/tracking endpoints (click, scan) — higher limit, short window */
  tracking: { maxRequests: 120, windowSeconds: 60 },
  /** Public data endpoints (public-page) — moderate limit */
  publicData: { maxRequests: 60, windowSeconds: 60 },
  /** File upload endpoints — low limit to prevent abuse */
  fileUpload: { maxRequests: 10, windowSeconds: 60 },
  /** Auth endpoints — strict limit to prevent brute force */
  auth: { maxRequests: 10, windowSeconds: 300 },
} as const;
