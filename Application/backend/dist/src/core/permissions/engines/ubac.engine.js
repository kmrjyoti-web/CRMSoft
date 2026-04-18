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
exports.UbacEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UbacEngine = class UbacEngine {
    constructor(prisma) {
        this.prisma = prisma;
        this.userCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async hasExplicitDeny(ctx) {
        const overrides = await this.getUserOverrides(ctx.userId);
        return overrides.denies.some((d) => this.matchesAction(ctx.action, d));
    }
    async hasExplicitGrant(ctx) {
        const overrides = await this.getUserOverrides(ctx.userId);
        return overrides.grants.some((g) => this.matchesAction(ctx.action, g));
    }
    matchesAction(action, override) {
        if (override === '*')
            return true;
        if (override.endsWith(':*')) {
            return action.startsWith(override.slice(0, -1));
        }
        return action === override;
    }
    async getUserOverrides(userId) {
        const cached = this.userCache.get(userId);
        if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
            return { grants: cached.grants, denies: cached.denies };
        }
        const overrides = await this.prisma.identity.userPermissionOverride.findMany({
            where: {
                userId,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });
        const grants = overrides.filter((o) => o.effect === 'grant').map((o) => o.action);
        const denies = overrides.filter((o) => o.effect === 'deny').map((o) => o.action);
        this.userCache.set(userId, { grants, denies, cachedAt: Date.now() });
        return { grants, denies };
    }
    invalidateUser(userId) {
        this.userCache.delete(userId);
    }
    invalidateAll() {
        this.userCache.clear();
    }
};
exports.UbacEngine = UbacEngine;
exports.UbacEngine = UbacEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UbacEngine);
//# sourceMappingURL=ubac.engine.js.map