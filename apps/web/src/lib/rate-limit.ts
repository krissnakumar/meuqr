/**
 * Simple in-memory rate limiter for API routes.
 * Note: This resets on server restart. For production with multiple instances,
 * consider using Redis or a database-backed approach.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000);

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

/**
 * Check if a request should be rate limited based on a unique key (e.g., IP address).
 * Returns the rate limit status with remaining requests and reset time.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // First request or window expired — start a new window
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
 * Extract a client IP from the request headers, falling back to a placeholder.
 */
export function getClientIp(request: Request): string {
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
