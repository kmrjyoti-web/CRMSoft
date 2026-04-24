import { Injectable } from '@nestjs/common';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  window: string;
  resetAt: Date;
  usage: {
    minute: { used: number; limit: number };
    hour: { used: number; limit: number };
    day: { used: number; limit: number };
  };
}

@Injectable()
export class RateLimiterService {
  private windows = new Map<string, number[]>();

  check(apiKeyId: string, limits: {
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  }): RateLimitResult {
    const now = Date.now();
    const usage = {
      minute: { used: 0, limit: limits.perMinute || Infinity },
      hour: { used: 0, limit: limits.perHour || Infinity },
      day: { used: 0, limit: limits.perDay || Infinity },
    };

    let allowed = true;
    let closestRemaining = Infinity;
    let closestLimit = 0;
    let closestWindow = 'HOUR';
    let closestResetAt = new Date(now + 3600000);

    // Check each window
    const checks = [
      { key: `${apiKeyId}:MINUTE`, windowMs: 60_000, limit: limits.perMinute, name: 'minute' },
      { key: `${apiKeyId}:HOUR`, windowMs: 3600_000, limit: limits.perHour, name: 'hour' },
      { key: `${apiKeyId}:DAY`, windowMs: 86400_000, limit: limits.perDay, name: 'day' },
    ];

    for (const check of checks) {
      if (!check.limit) continue;

      let timestamps = this.windows.get(check.key) || [];
      // Remove old timestamps
      timestamps = timestamps.filter(t => now - t < check.windowMs);

      const used = timestamps.length;
      const remaining = Math.max(0, check.limit - used);

      (usage as any)[check.name] = { used, limit: check.limit };

      if (used >= check.limit) {
        allowed = false;
      }

      if (remaining < closestRemaining) {
        closestRemaining = remaining;
        closestLimit = check.limit;
        closestWindow = check.name.toUpperCase();
        const oldestInWindow = timestamps.length > 0 ? timestamps[0] : now;
        closestResetAt = new Date(oldestInWindow + check.windowMs);
      }

      this.windows.set(check.key, timestamps);
    }

    // If allowed, add current timestamp to all windows
    if (allowed) {
      for (const check of checks) {
        if (!check.limit) continue;
        const timestamps = this.windows.get(check.key) || [];
        timestamps.push(now);
        this.windows.set(check.key, timestamps);
      }
    }

    return {
      allowed,
      remaining: closestRemaining === Infinity ? 999999 : closestRemaining,
      limit: closestLimit || 999999,
      window: closestWindow,
      resetAt: closestResetAt,
      usage,
    };
  }

  getUsage(apiKeyId: string): Record<string, { used: number }> {
    const now = Date.now();
    const result: Record<string, { used: number }> = {};

    for (const [key, timestamps] of this.windows.entries()) {
      if (key.startsWith(apiKeyId)) {
        const window = key.split(':')[1];
        const windowMs = window === 'MINUTE' ? 60_000 : window === 'HOUR' ? 3600_000 : 86400_000;
        const valid = timestamps.filter(t => now - t < windowMs);
        result[window] = { used: valid.length };
      }
    }

    return result;
  }

  reset(apiKeyId: string): void {
    for (const key of this.windows.keys()) {
      if (key.startsWith(apiKeyId)) {
        this.windows.delete(key);
      }
    }
  }

  cleanup(): void {
    const now = Date.now();
    const dayMs = 86400_000;

    for (const [key, timestamps] of this.windows.entries()) {
      const filtered = timestamps.filter(t => now - t < dayMs);
      if (filtered.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, filtered);
      }
    }
  }
}
