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
exports.PrismaTestPlanRepository = exports.TEST_PLAN_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.TEST_PLAN_REPOSITORY = Symbol('TEST_PLAN_REPOSITORY');
let PrismaTestPlanRepository = class PrismaTestPlanRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.testPlan.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.testPlan.findFirst({
            where: { id, isActive: true },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                    include: { evidences: true },
                },
            },
        });
    }
    async findByTenantId(tenantId, filters) {
        const where = { tenantId, isActive: true };
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const [items, total] = await Promise.all([
            this.prisma.platform.testPlan.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { _count: { select: { items: true } } },
            }),
            this.prisma.platform.testPlan.count({ where }),
        ]);
        return { items, total };
    }
    async update(id, data) {
        return this.prisma.platform.testPlan.update({ where: { id }, data: data });
    }
    async softDelete(id) {
        await this.prisma.platform.testPlan.update({ where: { id }, data: { isActive: false } });
    }
    async recalcStats(planId) {
        const items = await this.prisma.platform.testPlanItem.findMany({ where: { planId } });
        const total = items.length;
        const passed = items.filter(i => i.status === 'PASSED').length;
        const failed = items.filter(i => i.status === 'FAILED').length;
        const completed = items.filter(i => !['NOT_STARTED', 'IN_PROGRESS'].includes(i.status)).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        await this.prisma.platform.testPlan.update({
            where: { id: planId },
            data: {
                totalItems: total,
                passedItems: passed,
                failedItems: failed,
                completedItems: completed,
                progress,
                status: total > 0 && completed === total
                    ? (failed > 0 ? 'COMPLETED' : 'COMPLETED')
                    : 'ACTIVE',
            },
        });
    }
    async createItem(data) {
        return this.prisma.platform.testPlanItem.create({ data: data });
    }
    async findItemById(id) {
        return this.prisma.platform.testPlanItem.findUnique({
            where: { id },
            include: { evidences: true },
        });
    }
    async updateItem(id, data) {
        return this.prisma.platform.testPlanItem.update({ where: { id }, data: data });
    }
    async deleteItem(id) {
        await this.prisma.platform.testPlanItem.delete({ where: { id } });
    }
    async createEvidence(data) {
        return this.prisma.platform.testEvidence.create({ data: data });
    }
    async deleteEvidence(id) {
        await this.prisma.platform.testEvidence.delete({ where: { id } });
    }
};
exports.PrismaTestPlanRepository = PrismaTestPlanRepository;
exports.PrismaTestPlanRepository = PrismaTestPlanRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTestPlanRepository);
//# sourceMappingURL=test-plan.repository.js.map