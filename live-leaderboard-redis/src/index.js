import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis("redis://localhost:6379");

app.post("/post/:id/view", async (req, res) => {
  const views = await redis.incr(`post:${req.params.id}:view`);

  res.json({ message: "View incremented", views });
});

app.post("/leaderboard/score", async (req, res) => {
  const { userId, score } = req.body;
  const newScore = await redis.zincrby(`leaderboard`, score, userId);

  res.json({ message: "User score updated", score: newScore });
});

app.get("/leaderboard", async (req, res) => {
  const result = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");

  const players = [];

  for (let i = 0; i < result.length; i += 2) {
    players.push({
      username: result[i],
      score: Number(result[i + 1]),
    });
  }

  res.json({ players });
});

app.get("/leaderboard/:userId/rank", async (req, res) => {
  const rank = await redis.zrevrank("leaderboard", req.params.userId);

  res.json({ rank: rank + 1 });
});

app.listen(3000, () => {
  console.log("server running on http://localhost:3000");
});
