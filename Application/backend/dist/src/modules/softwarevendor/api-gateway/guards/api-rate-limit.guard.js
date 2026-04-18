"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rate_limiter_service_1 = require("../services/rate-limiter.service");
const app_error_1 = require("../../../../common/errors/app-error");
const api_rate_limit_decorator_1 = require("../decorators/api-rate-limit.decorator");
let ApiRateLimitGuard = class ApiRateLimitGuard {
    constructor(reflector, rateLimiter) {
        this.reflector = reflector;
        this.rateLimiter = rateLimiter;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const apiKey = request.apiKey;
        if (!apiKey)
            return true;
        const endpointLimit = this.reflector.getAllAndOverride(api_rate_limit_decorator_1.API_RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
        const limits = {
            perMinute: apiKey.rateLimitPerMinute || 60,
            perHour: apiKey.rateLimitPerHour || 1000,
            perDay: apiKey.rateLimitPerDay || 10000,
        };
        if (endpointLimit) {
            switch (endpointLimit.window) {
                case 'MINUTE':
                    limits.perMinute = Math.min(limits.perMinute, endpointLimit.limit);
                    break;
                case 'HOUR':
                    limits.perHour = Math.min(limits.perHour, endpointLimit.limit);
                    break;
                case 'DAY':
                    limits.perDay = Math.min(limits.perDay, endpointLimit.limit);
                    break;
            }
        }
        const result = this.rateLimiter.check(apiKey.id, limits);
        response.setHeader('X-RateLimit-Limit', result.limit);
        response.setHeader('X-RateLimit-Remaining', result.remaining);
        response.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000));
        response.setHeader('X-RateLimit-Window', result.window);
        if (!result.allowed) {
            response.setHeader('Retry-After', Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
            throw app_error_1.AppError.from('RATE_LIMIT_EXCEEDED').withDetails({
                limit: result.limit,
                window: result.window,
                retryAfter: result.resetAt.toISOString(),
                usage: result.usage,
            });
        }
        request.rateLimitInfo = result;
        return true;
    }
};
exports.ApiRateLimitGuard = ApiRateLimitGuard;
exports.ApiRateLimitGuard = ApiRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        rate_limiter_service_1.RateLimiterService])
], ApiRateLimitGuard);
//# sourceMappingURL=api-rate-limit.guard.js.map