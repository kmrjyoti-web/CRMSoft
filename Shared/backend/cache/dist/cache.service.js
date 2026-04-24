"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
/**
 * Generic cache service interface.
 * Default implementation uses in-memory Map (for testing/dev).
 * Production: extend and override with Redis/ioredis.
 */
let CacheService = CacheService_1 = class CacheService {
    constructor() {
        this.logger = new common_1.Logger(CacheService_1.name);
        this.store = new Map();
    }
    buildKey(key, prefix) {
        return prefix ? `${prefix}:${key}` : key;
    }
    async get(key, options) {
        const k = this.buildKey(key, options?.prefix);
        const entry = this.store.get(k);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.store.delete(k);
            return null;
        }
        try {
            return JSON.parse(entry.value);
        }
        catch {
            return null;
        }
    }
    async set(key, value, options) {
        const k = this.buildKey(key, options?.prefix);
        const ttl = options?.ttl ?? 300;
        this.store.set(k, {
            value: JSON.stringify(value),
            expiresAt: Date.now() + ttl * 1000,
        });
    }
    async del(key, options) {
        const k = this.buildKey(key, options?.prefix);
        this.store.delete(k);
    }
    async getOrSet(key, factory, options) {
        const cached = await this.get(key, options);
        if (cached !== null)
            return cached;
        const value = await factory();
        await this.set(key, value, options);
        return value;
    }
    async invalidatePattern(prefix) {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map