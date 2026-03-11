/**
 * In-memory rate limit store for anonymous passengers.
 * Keyed by IP address, value is the timestamp of their last post.
 *
 * Note: This store is local to the server process. In a multi-instance
 * deployment, rate limits are enforced per-instance (sufficient for
 * spam prevention on a small app).
 */
const passengerRateLimitStore = new Map<string, number>();

export const PASSENGER_RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const DRIVER_RATE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * The key used for requests whose IP address cannot be determined.
 * All such requests share a single rate-limit bucket.
 */
const UNKNOWN_IP_KEY = "__unknown__";

/**
 * Returns the IP address from the request headers.
 * Falls back to a shared sentinel value if no IP can be determined.
 */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (request.headers as Headers).get("x-real-ip") ?? UNKNOWN_IP_KEY;
}

/**
 * Checks if the given IP is rate-limited for passenger post creation.
 * Returns the number of milliseconds remaining until the next allowed post,
 * or 0 if not rate-limited.
 */
export function checkPassengerRateLimit(ip: string): number {
  const last = passengerRateLimitStore.get(ip);
  if (last === undefined) return 0;
  const elapsed = Date.now() - last;
  if (elapsed < PASSENGER_RATE_LIMIT_MS) {
    return PASSENGER_RATE_LIMIT_MS - elapsed;
  }
  return 0;
}

/**
 * Records a passenger post for the given IP, updating the rate limit store.
 */
export function recordPassengerPost(ip: string): void {
  passengerRateLimitStore.set(ip, Date.now());
}
