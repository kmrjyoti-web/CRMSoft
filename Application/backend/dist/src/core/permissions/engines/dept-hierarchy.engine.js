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
exports.DeptHierarchyEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DeptHierarchyEngine = class DeptHierarchyEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check(ctx) {
        if (ctx.roleLevel <= 1)
            return true;
        if (!ctx.departmentId && !ctx.departmentPath)
            return true;
        const actorPath = ctx.departmentPath || (await this.getDeptPath(ctx.departmentId));
        if (!actorPath)
            return true;
        const resourcePath = await this.getResourceDeptPath(ctx.resourceType, ctx.resourceId);
        if (!resourcePath)
            return true;
        return this.canAccess(actorPath, resourcePath);
    }
    canAccess(actorPath, resourcePath) {
        const a = this.normalizePath(actorPath);
        const r = this.normalizePath(resourcePath);
        if (a === r)
            return true;
        return r.startsWith(a + '/');
    }
    isAncestor(ancestorPath, descendantPath) {
        const a = this.normalizePath(ancestorPath);
        const d = this.normalizePath(descendantPath);
        return d.startsWith(a + '/') && d !== a;
    }
    isSibling(pathA, pathB) {
        const partsA = this.normalizePath(pathA).split('/').filter(Boolean);
        const partsB = this.normalizePath(pathB).split('/').filter(Boolean);
        if (partsA.length !== partsB.length || partsA.length < 2)
            return false;
        return partsA.slice(0, -1).join('/') === partsB.slice(0, -1).join('/');
    }
    getDepth(path) {
        return this.normalizePath(path).split('/').filter(Boolean).length;
    }
    async getDeptPath(deptId) {
        if (!deptId)
            return null;
        const dept = await this.prisma.identity.department.findUnique({
            where: { id: deptId },
            select: { path: true },
        });
        return dept?.path || null;
    }
    async getResourceDeptPath(resourceType, resourceId) {
        if (!resourceType || !resourceId)
            return null;
        return null;
    }
    normalizePath(path) {
        let n = path.trim();
        if (!n.startsWith('/'))
            n = '/' + n;
        if (n.endsWith('/') && n.length > 1)
            n = n.slice(0, -1);
        return n;
    }
};
exports.DeptHierarchyEngine = DeptHierarchyEngine;
exports.DeptHierarchyEngine = DeptHierarchyEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeptHierarchyEngine);
//# sourceMappingURL=dept-hierarchy.engine.js.map