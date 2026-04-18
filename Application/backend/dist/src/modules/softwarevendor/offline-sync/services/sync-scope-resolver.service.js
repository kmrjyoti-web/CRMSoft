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
exports.SyncScopeResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const entity_resolver_service_1 = require("./entity-resolver.service");
let SyncScopeResolverService = class SyncScopeResolverService {
    constructor(prisma, entityResolver) {
        this.prisma = prisma;
        this.entityResolver = entityResolver;
    }
    async resolveScope(userId, entityName, downloadScope) {
        switch (downloadScope) {
            case 'OWNED':
                return this.buildOwnedScope(userId, entityName);
            case 'TEAM':
                return this.buildTeamScope(userId, entityName);
            case 'ALL':
                return {};
            default:
                return this.buildOwnedScope(userId, entityName);
        }
    }
    buildOwnedScope(userId, entityName) {
        const config = this.entityResolver.getEntityConfig(entityName);
        const ownerFields = config.ownerFields;
        if (ownerFields.length === 0) {
            return {};
        }
        if (ownerFields.length === 1) {
            return { [ownerFields[0]]: userId };
        }
        return {
            OR: ownerFields.map((field) => ({ [field]: userId })),
        };
    }
    async buildTeamScope(userId, entityName) {
        const config = this.entityResolver.getEntityConfig(entityName);
        const ownerFields = config.ownerFields;
        if (ownerFields.length === 0) {
            return {};
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { departmentId: true },
        });
        if (!user?.departmentId) {
            return this.buildOwnedScope(userId, entityName);
        }
        const department = await this.prisma.department.findUnique({
            where: { id: user.departmentId },
            select: { path: true },
        });
        if (!department?.path) {
            return this.buildOwnedScope(userId, entityName);
        }
        const departments = await this.prisma.department.findMany({
            where: { path: { startsWith: department.path } },
            select: { id: true },
        });
        const deptIds = departments.map((d) => d.id);
        const teamMembers = await this.prisma.user.findMany({
            where: { departmentId: { in: deptIds }, status: 'ACTIVE' },
            select: { id: true },
        });
        const teamUserIds = teamMembers.map((u) => u.id);
        if (ownerFields.length === 1) {
            return { [ownerFields[0]]: { in: teamUserIds } };
        }
        return {
            OR: ownerFields.map((field) => ({
                [field]: { in: teamUserIds },
            })),
        };
    }
};
exports.SyncScopeResolverService = SyncScopeResolverService;
exports.SyncScopeResolverService = SyncScopeResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        entity_resolver_service_1.EntityResolverService])
], SyncScopeResolverService);
//# sourceMappingURL=sync-scope-resolver.service.js.map