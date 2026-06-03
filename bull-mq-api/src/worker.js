import { Worker } from "bullmq";
import { connection } from "./queue.js";

const emailWorker = new Worker(
  "emails",
  async (job) => {
    console.log("Processing email job...", job.id, job.name, job.data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Email job compleleted!", job.id, job.name, job.data);
  },
  { connection },
);

emailWorker.on("compleleted", (job) => {
  {
    console.log("Job completed!", job.id, job.name, job.data);
  }
});

emailWorker.on("failed", (job, err) => {
  console.log("Job failed!", job.id, job.name, job.data, err);
});
