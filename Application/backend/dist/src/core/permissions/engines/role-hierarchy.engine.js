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
exports.RoleHierarchyEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RoleHierarchyEngine = class RoleHierarchyEngine {
    constructor(prisma) {
        this.prisma = prisma;
        this.roleMap = new Map();
        this.cacheLoadedAt = 0;
        this.CACHE_TTL = 15 * 60 * 1000;
    }
    async check(ctx, targetRoleLevel) {
        if (ctx.roleLevel === 0)
            return true;
        if (targetRoleLevel === undefined)
            return true;
        const role = await this.getRoleInfo(ctx.roleId);
        if (!role)
            return false;
        if (role.canManageLevels.length > 0 && role.canManageLevels.includes(targetRoleLevel)) {
            return true;
        }
        return ctx.roleLevel < targetRoleLevel;
    }
    async getEffectivePermissions(userId) {
        const user = await this.prisma.identity.user.findUnique({
            where: { id: userId },
            select: { roleId: true, role: { select: { level: true } } },
        });
        if (!user)
            return [];
        const userLevel = user.role.level;
        if (userLevel === 0) {
            const all = await this.prisma.identity.permission.findMany();
            return all.map((p) => `${p.module}:${p.action}`);
        }
        const inheritableRoles = await this.prisma.identity.role.findMany({
            where: { level: { gte: userLevel } },
            select: { id: true },
        });
        const roleIds = inheritableRoles.map((r) => r.id);
        const rolePerms = await this.prisma.identity.rolePermission.findMany({
            where: { roleId: { in: roleIds } },
            include: { permission: true },
        });
        const permSet = new Set(rolePerms.map((rp) => `${rp.permission.module}:${rp.permission.action}`));
        return [...permSet];
    }
    async canManageUser(managerUserId, targetUserId) {
        const [manager, target] = await Promise.all([
            this.prisma.identity.user.findUnique({
                where: { id: managerUserId },
                select: { role: { select: { id: true, level: true, canManageLevels: true } } },
            }),
            this.prisma.identity.user.findUnique({
                where: { id: targetUserId },
                select: { role: { select: { level: true } } },
            }),
        ]);
        if (!manager || !target)
            return false;
        if (manager.role.level === 0)
            return true;
        if (manager.role.canManageLevels.length > 0) {
            return manager.role.canManageLevels.includes(target.role.level);
        }
        return manager.role.level < target.role.level;
    }
    async getRoleInfo(roleId) {
        await this.ensureCacheLoaded();
        return this.roleMap.get(roleId) || null;
    }
    async ensureCacheLoaded() {
        if (this.roleMap.size > 0 && Date.now() - this.cacheLoadedAt < this.CACHE_TTL) {
            return;
        }
        const roles = await this.prisma.identity.role.findMany({
            select: { id: true, name: true, level: true, canManageLevels: true },
        });
        this.roleMap.clear();
        for (const role of roles)
            this.roleMap.set(role.id, role);
        this.cacheLoadedAt = Date.now();
    }
    async getAllPermissionCodes() {
        const all = await this.prisma.identity.permission.findMany();
        return all.map((p) => `${p.module}:${p.action}`);
    }
    invalidateAll() {
        this.roleMap.clear();
        this.cacheLoadedAt = 0;
    }
};
exports.RoleHierarchyEngine = RoleHierarchyEngine;
exports.RoleHierarchyEngine = RoleHierarchyEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleHierarchyEngine);
//# sourceMappingURL=role-hierarchy.engine.js.map