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
exports.ModuleAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let ModuleAccessService = class ModuleAccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByPlan(planId) {
        const plan = await this.prisma.identity.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan ${planId} not found`);
        }
        return this.prisma.identity.planModuleAccess.findMany({
            where: { planId },
            orderBy: { moduleCode: 'asc' },
        });
    }
    async upsertAccess(planId, modules) {
        const plan = await this.prisma.identity.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan ${planId} not found`);
        }
        return this.prisma.identity.$transaction(modules.map((mod) => this.prisma.identity.planModuleAccess.upsert({
            where: {
                planId_moduleCode: { planId, moduleCode: mod.moduleCode },
            },
            update: {
                accessLevel: mod.accessLevel,
                customConfig: mod.customConfig ?? null,
            },
            create: {
                planId,
                moduleCode: mod.moduleCode,
                accessLevel: mod.accessLevel,
                customConfig: mod.customConfig ?? null,
            },
        })));
    }
    async checkAccess(tenantId, moduleCode) {
        const moduleDef = await this.prisma.platform.moduleDefinition.findUnique({
            where: { code: moduleCode },
        });
        if (moduleDef?.isCore) {
            return { allowed: true, accessLevel: 'MOD_FULL' };
        }
        const subscription = await this.prisma.identity.subscription.findFirst({
            where: {
                tenantId,
                status: { in: ['ACTIVE', 'TRIALING'] },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!subscription) {
            return { allowed: false, accessLevel: 'MOD_DISABLED' };
        }
        const access = await this.prisma.identity.planModuleAccess.findUnique({
            where: {
                planId_moduleCode: {
                    planId: subscription.planId,
                    moduleCode,
                },
            },
        });
        if (!access) {
            return { allowed: false, accessLevel: 'MOD_DISABLED' };
        }
        if (access.accessLevel === 'MOD_DISABLED') {
            return { allowed: false, accessLevel: 'MOD_DISABLED' };
        }
        return { allowed: true, accessLevel: access.accessLevel };
    }
    async getAccessMatrix() {
        const plans = await this.prisma.identity.plan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                code: true,
                moduleAccess: {
                    orderBy: { moduleCode: 'asc' },
                },
            },
        });
        const modules = await this.prisma.platform.moduleDefinition.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
        return { plans, modules };
    }
};
exports.ModuleAccessService = ModuleAccessService;
exports.ModuleAccessService = ModuleAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModuleAccessService);
//# sourceMappingURL=module-access.service.js.map