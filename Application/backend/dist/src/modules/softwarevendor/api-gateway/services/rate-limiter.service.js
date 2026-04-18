"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
let RateLimiterService = class RateLimiterService {
    constructor() {
        this.windows = new Map();
    }
    check(apiKeyId, limits) {
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
        const checks = [
            { key: `${apiKeyId}:MINUTE`, windowMs: 60_000, limit: limits.perMinute, name: 'minute' },
            { key: `${apiKeyId}:HOUR`, windowMs: 3600_000, limit: limits.perHour, name: 'hour' },
            { key: `${apiKeyId}:DAY`, windowMs: 86400_000, limit: limits.perDay, name: 'day' },
        ];
        for (const check of checks) {
            if (!check.limit)
                continue;
            let timestamps = this.windows.get(check.key) || [];
            timestamps = timestamps.filter(t => now - t < check.windowMs);
            const used = timestamps.length;
            const remaining = Math.max(0, check.limit - used);
            usage[check.name] = { used, limit: check.limit };
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
        if (allowed) {
            for (const check of checks) {
                if (!check.limit)
                    continue;
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
    getUsage(apiKeyId) {
        const now = Date.now();
        const result = {};
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
    reset(apiKeyId) {
        for (const key of this.windows.keys()) {
            if (key.startsWith(apiKeyId)) {
                this.windows.delete(key);
            }
        }
    }
    cleanup() {
        const now = Date.now();
        const dayMs = 86400_000;
        for (const [key, timestamps] of this.windows.entries()) {
            const filtered = timestamps.filter(t => now - t < dayMs);
            if (filtered.length === 0) {
                this.windows.delete(key);
            }
            else {
                this.windows.set(key, filtered);
            }
        }
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)()
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map