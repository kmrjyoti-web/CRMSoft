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
exports.RbacEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RbacEngine = class RbacEngine {
    constructor(prisma) {
        this.prisma = prisma;
        this.roleCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async check(ctx) {
        if (ctx.roleLevel === 0)
            return true;
        const permissions = await this.getRolePermissions(ctx.roleId);
        return this.matchesAny(ctx.action, permissions);
    }
    matchesPermission(action, permission) {
        if (permission === '*')
            return true;
        if (permission.endsWith(':*')) {
            return action.startsWith(permission.slice(0, -1));
        }
        return action === permission;
    }
    matchesAny(action, permissions) {
        return permissions.some((p) => this.matchesPermission(action, p));
    }
    async getRolePermissions(roleId) {
        const cached = this.roleCache.get(roleId);
        if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
            return cached.permissions;
        }
        const rolePermissions = await this.prisma.identity.rolePermission.findMany({
            where: { roleId },
            include: { permission: true },
        });
        const permissions = rolePermissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`);
        this.roleCache.set(roleId, { permissions, cachedAt: Date.now() });
        return permissions;
    }
    invalidateRole(roleId) {
        this.roleCache.delete(roleId);
    }
    invalidateAll() {
        this.roleCache.clear();
    }
};
exports.RbacEngine = RbacEngine;
exports.RbacEngine = RbacEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RbacEngine);
//# sourceMappingURL=rbac.engine.js.map