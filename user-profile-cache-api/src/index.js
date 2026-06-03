import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function userKey(id, type) {
  return `user:${id}:${type}`;
}

app.post("/user/:id/json", async (req, res) => {
  await redis.set(userKey(req.params.id, "json"), JSON.stringify(req.body));

  res.json({ savedAs: "json" });
});

app.get("/user/:id/json", async (req, res) => {
  const raw = await redis.get(userKey(req.params.id, "json"));

  res.json({
    user: raw ? JSON.parse(raw) : null,
  });
});

app.post("/user/:id/hash", async (req, res) => {
  await redis.hset(userKey(req.params.id, "hash"), req.body);

  res.json({ savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
  const user = await redis.hgetall(userKey(req.params.id, "hash"));
  res.json({ user });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
