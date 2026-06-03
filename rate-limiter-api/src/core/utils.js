export function rateLimiterKey(ip, type) {
  return `rate_limit:${type}:${ip}`;
}
