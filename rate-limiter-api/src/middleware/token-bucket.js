import {
  BUCKET_CAPACITY,
  BUCKET_REFILL_RATE,
  RateLimiterType,
} from "../core/constants.js";
import { redis } from "../core/redis.js";
import { rateLimiterKey } from "../core/utils.js";

export async function tokenBucketLimiter(req, res, next) {
  const key = rateLimiterKey(req.ip, RateLimiterType.BUCKET);

  try {
    const now = Date.now();

    let bucket = await redis.hgetall(key);

    if (Object.keys(bucket).length === 0) {
      bucket = {
        tokens: BUCKET_CAPACITY,
        lastRefill: now,
      };
    }

    const tokens = Number(bucket.tokens);
    const lastRefill = Number(bucket.lastRefill);

    const elapsedSeconds = (now - lastRefill) / 1000;
    const tokensToAdd = Math.floor(elapsedSeconds * BUCKET_REFILL_RATE);

    const availableTokens = Math.min(BUCKET_CAPACITY, tokens + tokensToAdd);

    if (availableTokens <= 0) {
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
    }

    const remainingTokens = availableTokens - 1;

    await redis.hset(key, {
      tokens: remainingTokens,
      lastRefill: now,
    });

    await redis.expire(key, 3600);

    next();
  } catch (error) {
    console.error("Token Bucket failed ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
}
