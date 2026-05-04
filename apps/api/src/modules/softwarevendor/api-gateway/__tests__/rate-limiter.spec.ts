import { RateLimiterService } from '../services/rate-limiter.service';

describe('RateLimiterService', () => {
  let service: RateLimiterService;

  beforeEach(() => {
    service = new RateLimiterService();
  });

  it('should allow requests within limit', () => {
    const result = service.check('key1', { perMinute: 10 });
    expect(result.allowed).toBe(true);
    // After first request, second call should show 9 remaining
    const result2 = service.check('key1', { perMinute: 10 });
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(9);
  });

  it('should block requests exceeding minute limit', () => {
    for (let i = 0; i < 5; i++) {
      service.check('key2', { perMinute: 5 });
    }
    const result = service.check('key2', { perMinute: 5 });
    expect(result.allowed).toBe(false);
  });

  it('should track usage across windows', () => {
    service.check('key3', { perMinute: 100, perHour: 1000, perDay: 10000 });
    const usage = service.getUsage('key3');
    expect(usage.MINUTE?.used).toBe(1);
  });

  it('should reset usage for a key', () => {
    service.check('key4', { perMinute: 10 });
    service.check('key4', { perMinute: 10 });
    service.reset('key4');
    const usage = service.getUsage('key4');
    expect(Object.keys(usage)).toHaveLength(0);
  });

  it('should return rate limit info with reset time', () => {
    const result = service.check('key5', { perMinute: 100 });
    expect(result.resetAt).toBeInstanceOf(Date);
    expect(result.window).toBeDefined();
    expect(result.limit).toBeDefined();
  });

  it('should enforce per-hour limit independently', () => {
    for (let i = 0; i < 3; i++) {
      service.check('key6', { perMinute: 100, perHour: 3 });
    }
    const result = service.check('key6', { perMinute: 100, perHour: 3 });
    expect(result.allowed).toBe(false);
  });

  it('should cleanup stale entries', () => {
    service.check('key7', { perMinute: 10 });
    service.cleanup();
    // Should not throw
    const result = service.check('key7', { perMinute: 10 });
    expect(result.allowed).toBe(true);
  });
});
