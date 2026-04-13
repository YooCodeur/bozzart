const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
}

/**
 * Rate limiter en memoire (pour un seul serveur).
 * En production avec plusieurs instances, utiliser Redis ou Upstash.
 */
export function rateLimit(
  key: string,
  { windowMs = 60_000, maxRequests = 30 }: RateLimitConfig = {},
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

// Nettoyage periodique des entrees expirees
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);
