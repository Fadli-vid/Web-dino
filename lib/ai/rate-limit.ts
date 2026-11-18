interface BucketRecord {
  minuteTimestamps: number[];
  hourTimestamps: number[];
}

const ipBuckets = new Map<string, BucketRecord>();

const MAX_REQUESTS_PER_MINUTE = 6;
const MAX_REQUESTS_PER_HOUR = 30;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingMinute: number;
}

/**
 * Lightweight in-memory sliding-window limiter for live (uncached) Gemini API calls.
 * Cached hits from TiDB bypass this limiter completely.
 */
export function checkAiRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const key = identifier || 'anonymous';
  const record = ipBuckets.get(key) ?? { minuteTimestamps: [], hourTimestamps: [] };

  record.minuteTimestamps = record.minuteTimestamps.filter((ts) => now - ts < ONE_MINUTE_MS);
  record.hourTimestamps = record.hourTimestamps.filter((ts) => now - ts < ONE_HOUR_MS);

  if (record.minuteTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = record.minuteTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((ONE_MINUTE_MS - (now - oldest)) / 1000));
    ipBuckets.set(key, record);
    return { allowed: false, retryAfterSeconds, remainingMinute: 0 };
  }

  if (record.hourTimestamps.length >= MAX_REQUESTS_PER_HOUR) {
    const oldest = record.hourTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((ONE_HOUR_MS - (now - oldest)) / 1000));
    ipBuckets.set(key, record);
    return { allowed: false, retryAfterSeconds, remainingMinute: 0 };
  }

  record.minuteTimestamps.push(now);
  record.hourTimestamps.push(now);
  ipBuckets.set(key, record);

  // Periodic map sweep to keep memory bounded
  if (ipBuckets.size > 500) {
    for (const [entryKey, entryVal] of ipBuckets.entries()) {
      const freshHour = entryVal.hourTimestamps.filter((ts) => now - ts < ONE_HOUR_MS);
      if (freshHour.length === 0) {
        ipBuckets.delete(entryKey);
      }
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingMinute: MAX_REQUESTS_PER_MINUTE - record.minuteTimestamps.length,
  };
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || 'local-dev';
}
