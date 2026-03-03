import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../services/rate-limiter.service';
import { AppError } from '../../../common/errors/app-error';
import { API_RATE_LIMIT_KEY } from '../decorators/api-rate-limit.decorator';

@Injectable()
export class ApiRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const apiKey = request.apiKey;

    if (!apiKey) return true; // No API key context, skip rate limiting

    // Get per-endpoint override if any
    const endpointLimit = this.reflector.getAllAndOverride<{ limit: number; window: string }>(
      API_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const limits = {
      perMinute: apiKey.rateLimitPerMinute || 60,
      perHour: apiKey.rateLimitPerHour || 1000,
      perDay: apiKey.rateLimitPerDay || 10000,
    };

    // Apply endpoint-level override if present
    if (endpointLimit) {
      switch (endpointLimit.window) {
        case 'MINUTE': limits.perMinute = Math.min(limits.perMinute, endpointLimit.limit); break;
        case 'HOUR': limits.perHour = Math.min(limits.perHour, endpointLimit.limit); break;
        case 'DAY': limits.perDay = Math.min(limits.perDay, endpointLimit.limit); break;
      }
    }

    const result = this.rateLimiter.check(apiKey.id, limits);

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000));
    response.setHeader('X-RateLimit-Window', result.window);

    if (!result.allowed) {
      response.setHeader('Retry-After', Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
      throw AppError.from('RATE_LIMIT_EXCEEDED').withDetails({
        limit: result.limit,
        window: result.window,
        retryAfter: result.resetAt.toISOString(),
        usage: result.usage,
      });
    }

    // Attach rate limit info to request for logging
    request.rateLimitInfo = result;

    return true;
  }
}
