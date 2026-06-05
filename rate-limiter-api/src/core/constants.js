export const WINDOW_SECONDS = 60;
export const WINDOW_MS = WINDOW_SECONDS * 1000;
export const MAX_REQUESTS = 5;
export const BUCKET_CAPACITY = 10;
export const BUCKET_REFILL_RATE = 1;

export const RateLimiterType = {
  FIXED: "fixed",
  SLIDING: "sliding",
  BUCKET: "bucket",
};
