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
exports.PlanLimitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let PlanLimitService = class PlanLimitService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByPlan(planId) {
        const plan = await this.prisma.identity.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return this.prisma.identity.planLimit.findMany({
            where: { planId },
            orderBy: { resourceKey: 'asc' },
        });
    }
    async upsertLimits(planId, limits) {
        const plan = await this.prisma.identity.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const results = await Promise.all(limits.map((item) => this.prisma.identity.planLimit.upsert({
            where: {
                planId_resourceKey: { planId, resourceKey: item.resourceKey },
            },
            update: {
                limitType: item.limitType,
                limitValue: item.limitType === 'UNLIMITED' || item.limitType === 'DISABLED' ? 0 : item.limitValue,
                isChargeable: item.isChargeable ?? false,
                chargeTokens: item.chargeTokens ?? 0,
            },
            create: {
                planId,
                resourceKey: item.resourceKey,
                limitType: item.limitType,
                limitValue: item.limitType === 'UNLIMITED' || item.limitType === 'DISABLED' ? 0 : item.limitValue,
                isChargeable: item.isChargeable ?? false,
                chargeTokens: item.chargeTokens ?? 0,
            },
        })));
        return results;
    }
    async deleteLimit(planId, limitId) {
        const limit = await this.prisma.identity.planLimit.findFirst({
            where: { id: limitId, planId },
        });
        if (!limit)
            throw new common_1.NotFoundException('Plan limit not found');
        return this.prisma.identity.planLimit.delete({ where: { id: limitId } });
    }
    async getResourceLimit(planId, resourceKey) {
        return this.prisma.identity.planLimit.findUnique({
            where: { planId_resourceKey: { planId, resourceKey } },
        });
    }
};
exports.PlanLimitService = PlanLimitService;
exports.PlanLimitService = PlanLimitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanLimitService);
//# sourceMappingURL=plan-limit.service.js.map