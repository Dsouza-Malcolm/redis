import {
  MAX_REQUESTS,
  RateLimiterType,
  WINDOW_SECONDS,
} from "../core/constants.js";
import { redis } from "../core/redis.js";
import { rateLimiterKey } from "../core/utils.js";

export async function fixedRateLimiter(req, res, next) {
  const key = rateLimiterKey(req.ip, RateLimiterType.FIXED);
  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(key);

    console.log({
      ttl,
      count,
      key,
    });

    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaning", Math.max(0, MAX_REQUESTS - count));
    res.setHeader("Retry-After", ttl > 0 ? ttl : 0);

    if (count > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests",
        retryAfter: ttl,
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next();
  }
}
