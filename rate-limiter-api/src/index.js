import express from "express";
import { fixedRateLimiter } from "./middleware/fixed-window.js";
import { slidingLimiter } from "./middleware/sliding-window.js";

const app = express();
app.use(express.json());

const data = {
  id: 1,
  name: "Malcolm Dsouza",
  email: "malcolm@gmail.com",
};

app.get("/fixed", fixedRateLimiter, async (req, res) => {
  res.json({ data });
});

app.get("/sliding", slidingLimiter, async (req, res) => {
  res.json({ data });
});

app.get("/bucket", async (req, res) => {});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
