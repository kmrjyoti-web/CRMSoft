import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../services/rate-limiter.service';
export declare class ApiRateLimitGuard implements CanActivate {
    private readonly reflector;
    private readonly rateLimiter;
    constructor(reflector: Reflector, rateLimiter: RateLimiterService);
    canActivate(context: ExecutionContext): boolean;
}
