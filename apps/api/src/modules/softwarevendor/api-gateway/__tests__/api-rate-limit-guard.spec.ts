import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../services/rate-limiter.service';

describe('ApiRateLimitGuard', () => {
  let guard: ApiRateLimitGuard;
  let mockReflector: Reflector;
  let rateLimiter: RateLimiterService;

  beforeEach(() => {
    mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(null) } as any;
    rateLimiter = new RateLimiterService();
    guard = new ApiRateLimitGuard(mockReflector, rateLimiter);
  });

  const createContext = (apiKey: any = null) => {
    const mockRes = { setHeader: jest.fn() };
    return {
      switchToHttp: () => ({
        getRequest: () => ({ apiKey }),
        getResponse: () => mockRes,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };
  };

  it('should allow when no API key context', () => {
    expect(guard.canActivate(createContext() as any)).toBe(true);
  });

  it('should allow request within limits', () => {
    const ctx = createContext({ id: 'k1', rateLimitPerMinute: 100 });
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('should set rate limit headers', () => {
    const ctx = createContext({ id: 'k2', rateLimitPerMinute: 100 });
    guard.canActivate(ctx as any);
    const res = ctx.switchToHttp().getResponse();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
  });

  it('should reject when rate limit exceeded', () => {
    const apiKey = { id: 'k3', rateLimitPerMinute: 2 };
    guard.canActivate(createContext(apiKey) as any);
    guard.canActivate(createContext(apiKey) as any);
    expect(() => guard.canActivate(createContext(apiKey) as any)).toThrow();
  });
});
