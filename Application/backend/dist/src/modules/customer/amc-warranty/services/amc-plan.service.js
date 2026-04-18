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
exports.AMCPlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AMCPlanService = class AMCPlanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.aMCPlanTemplate.findMany({
            where: {
                OR: [{ tenantId }, { isSystemTemplate: true }],
                ...(filters?.industryCode && { industryCode: filters.industryCode }),
                ...(filters?.planTier && { planTier: filters.planTier }),
                isActive: true,
            },
            include: { _count: { select: { contracts: true } } },
            orderBy: [{ isSystemTemplate: 'asc' }, { charges: 'asc' }],
        });
    }
    async findById(id) {
        const plan = await this.prisma.working.aMCPlanTemplate.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('AMC plan not found');
        return plan;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { tenantId, code: dto.code } });
        if (existing)
            throw new common_1.ConflictException(`AMC plan with code ${dto.code} already exists`);
        return this.prisma.working.aMCPlanTemplate.create({
            data: { ...dto, tenantId, isSystemTemplate: false },
        });
    }
    async update(tenantId, id, dto) {
        const plan = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { id, tenantId, isSystemTemplate: false } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found or cannot edit system plan');
        return this.prisma.working.aMCPlanTemplate.update({ where: { id }, data: dto });
    }
    async importSystemPlan(tenantId, systemPlanId) {
        const systemPlan = await this.prisma.working.aMCPlanTemplate.findFirst({
            where: { id: systemPlanId, isSystemTemplate: true },
        });
        if (!systemPlan)
            throw new common_1.NotFoundException('System plan not found');
        const { id, tenantId: _, isSystemTemplate, createdAt, updatedAt, ...data } = systemPlan;
        const newCode = `${data.code}-${tenantId.slice(0, 4).toUpperCase()}`;
        const existing = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { tenantId, code: newCode } });
        if (existing)
            throw new common_1.ConflictException('Plan already imported');
        return this.prisma.working.aMCPlanTemplate.create({
            data: { ...data, tenantId, code: newCode, isSystemTemplate: false },
        });
    }
};
exports.AMCPlanService = AMCPlanService;
exports.AMCPlanService = AMCPlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AMCPlanService);
//# sourceMappingURL=amc-plan.service.js.map