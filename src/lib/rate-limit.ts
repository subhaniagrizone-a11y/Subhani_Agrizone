type Bucket = {
  count: number;
  resetAt: number;
  lastSeen: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

function pruneBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) {
      buckets.delete(key);
    }
  }

  if (buckets.size <= MAX_BUCKETS) return;

  const overflow = buckets.size - MAX_BUCKETS;
  const oldestKeys = Array.from(buckets.entries())
    .sort((left, right) => left[1].lastSeen - right[1].lastSeen)
    .slice(0, overflow)
    .map(([key]) => key);

  oldestKeys.forEach((key) => buckets.delete(key));
}

export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  pruneBuckets(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs, lastSeen: now });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    bucket.lastSeen = now;
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  bucket.lastSeen = now;
  return { success: true, remaining: limit - bucket.count };
}
