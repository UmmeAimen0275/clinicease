// Simple login limiter: max 5 failed tries per email in 10 minutes.
// (In memory, so it resets when the server restarts. Fine for a hackathon.)
const attempts = new Map<string, { count: number; reset: number }>();

export function isBlocked(key: string, max = 5) {
  const a = attempts.get(key);
  if (!a || Date.now() > a.reset) return false;
  return a.count >= max;
}

export function recordFailure(key: string, windowMs = 10 * 60_000) {
  const a = attempts.get(key);
  if (!a || Date.now() > a.reset) attempts.set(key, { count: 1, reset: Date.now() + windowMs });
  else a.count++;
}

export function clearFailures(key: string) {
  attempts.delete(key);
}