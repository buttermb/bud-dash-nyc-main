/**
 * Client-side rate limiting utility
 * Prevents abuse and excessive API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed
   * @param key - Unique identifier (e.g., user ID, IP, action type)
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this key
    const existingRequests = this.requests.get(key) || [];

    // Filter out requests outside the time window
    const recentRequests = existingRequests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const existingRequests = this.requests.get(key) || [];
    const recentRequests = existingRequests.filter(time => time > windowStart);
    
    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Clean up old entries (call periodically)
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [key, times] of this.requests.entries()) {
      const recent = times.filter(time => now - time < maxAge);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Predefined rate limit configs
export const RATE_LIMITS = {
  // API calls
  API_GENERAL: { maxRequests: 60, windowMs: 60000 }, // 60 per minute
  API_SEARCH: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  API_CART: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  
  // User actions
  ADD_TO_CART: { maxRequests: 10, windowMs: 10000 }, // 10 per 10 seconds
  SUBMIT_FORM: { maxRequests: 3, windowMs: 60000 }, // 3 per minute
  SHARE: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  
  // Auth
  LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
  SIGNUP: { maxRequests: 3, windowMs: 600000 }, // 3 per 10 minutes
} as const;

// Cleanup old entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 300000);
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(key: string, config: RateLimitConfig) {
  const check = () => rateLimiter.check(key, config);
  const getRemaining = () => rateLimiter.getRemaining(key, config);
  const reset = () => rateLimiter.reset(key);

  return { check, getRemaining, reset };
}
