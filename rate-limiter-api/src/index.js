import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis("redis://localhost:6379");

const data = {
  id: 1,
  name: "Malcolm Dsouza",
  email: "malcolm@gmail.com",
};

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

function rateLimiterKey(ip) {
  return `rate_limit:${ip}`;
}

async function fixedRateLimiter(req, res, next) {
  const key = rateLimiterKey(req.ip);
  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(key);

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

app.get("/fixed", fixedRateLimiter, async (req, res) => {
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  res.json({ data });
});

app.get("/sliding", async (req, res) => {});

app.get("/bucket", async (req, res) => {});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
