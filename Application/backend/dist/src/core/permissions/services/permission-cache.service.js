"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCacheService = void 0;
const common_1 = require("@nestjs/common");
let PermissionCacheService = class PermissionCacheService {
    constructor() {
        this.store = new Map();
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.data;
    }
    set(key, data, ttlMs) {
        this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
    }
    invalidate(key) {
        this.store.delete(key);
    }
    invalidatePrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }
    clear() {
        this.store.clear();
    }
    get size() {
        return this.store.size;
    }
};
exports.PermissionCacheService = PermissionCacheService;
exports.PermissionCacheService = PermissionCacheService = __decorate([
    (0, common_1.Injectable)()
], PermissionCacheService);
//# sourceMappingURL=permission-cache.service.js.map