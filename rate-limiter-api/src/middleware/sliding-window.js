import {
  MAX_REQUESTS,
  RateLimiterType,
  WINDOW_MS,
  WINDOW_SECONDS,
} from "../core/constants.js";
import { redis } from "../core/redis.js";
import { rateLimiterKey } from "../core/utils.js";

export async function slidingLimiter(req, res, next) {
  const key = rateLimiterKey(req.ip, RateLimiterType.SLIDING);
  const requests = await redis.zrange(key, 0, -1, "WITHSCORES");

  console.log(requests);

  try {
    const now = Date.now();

    const windowStart = now - WINDOW_MS;

    await redis.zremrangebyscore(key, 0, windowStart);

    const count = await redis.zcard(key);

    console.log({ count });

    if (count >= MAX_REQUESTS) {
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
    }

    const result = await redis.zadd(key, now, `${now}:${Math.random()}`);

    await redis.expire(key, WINDOW_SECONDS);

    next();
  } catch (error) {
    console.error("Sliding window failed ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
}
