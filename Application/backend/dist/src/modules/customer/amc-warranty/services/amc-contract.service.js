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
exports.AMCContractService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AMCContractService = class AMCContractService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.aMCContract.count({ where: { tenantId } });
        return `AMC-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.aMCContract.findMany({
            where: {
                tenantId,
                ...(filters?.customerId && { customerId: filters.customerId }),
                ...(filters?.status && { status: filters.status }),
            },
            include: { plan: true, _count: { select: { schedules: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const contract = await this.prisma.working.aMCContract.findFirst({
            where: { id, tenantId },
            include: {
                plan: true,
                schedules: { orderBy: { scheduleDate: 'asc' } },
            },
        });
        if (!contract)
            throw new common_1.NotFoundException('AMC contract not found');
        return contract;
    }
    async findExpiring(tenantId, days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        return this.prisma.working.aMCContract.findMany({
            where: {
                tenantId,
                status: 'ACTIVE',
                endDate: { lte: cutoff, gte: new Date() },
            },
            include: { plan: true },
            orderBy: { endDate: 'asc' },
        });
    }
    async create(tenantId, dto) {
        const plan = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { id: dto.amcPlanId } });
        if (!plan)
            throw new common_1.NotFoundException('AMC plan not found');
        const contractNumber = await this.generateNumber(tenantId);
        const balanceAmount = Number(dto.totalAmount) - (Number(dto.paidAmount) ?? 0);
        const contract = await this.prisma.working.aMCContract.create({
            data: {
                ...dto,
                tenantId,
                contractNumber,
                balanceAmount,
                freeVisitsTotal: plan.freeVisits,
                freeCallsTotal: plan.freeCallSupport,
                freeOnlineTotal: plan.freeOnlineSupport,
                billingCycle: plan.billingCycle,
                status: 'DRAFT',
            },
            include: { plan: true },
        });
        return contract;
    }
    async activate(tenantId, id) {
        const contract = await this.prisma.working.aMCContract.findFirst({ where: { id, tenantId } });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        const plan = await this.prisma.working.aMCPlanTemplate.findUnique({ where: { id: contract.amcPlanId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const schedules = [];
        if (plan.visitScheduleType === 'INTERVAL_MONTHS' && plan.visitScheduleValue) {
            const endDate = new Date(contract.endDate);
            let currentDate = new Date(contract.startDate);
            currentDate.setMonth(currentDate.getMonth() + plan.visitScheduleValue);
            while (currentDate <= endDate) {
                schedules.push({
                    tenantId,
                    amcContractId: id,
                    scheduleDate: new Date(currentDate),
                    scheduleType: 'PREVENTIVE',
                    status: 'SCHEDULED',
                });
                currentDate.setMonth(currentDate.getMonth() + plan.visitScheduleValue);
            }
        }
        await this.prisma.$transaction([
            this.prisma.working.aMCContract.update({ where: { id }, data: { status: 'ACTIVE' } }),
            ...schedules.map((s) => this.prisma.working.aMCSchedule.create({ data: s })),
        ]);
        return this.findById(tenantId, id);
    }
    async renew(tenantId, id, dto) {
        const contract = await this.prisma.working.aMCContract.findFirst({
            where: { id, tenantId },
            include: { plan: true },
        });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        const plan = contract.plan;
        const newStart = new Date(contract.endDate);
        newStart.setDate(newStart.getDate() + 1);
        const newEnd = new Date(newStart);
        if (plan.durationType === 'MONTHS')
            newEnd.setMonth(newEnd.getMonth() + plan.durationValue);
        else
            newEnd.setFullYear(newEnd.getFullYear() + plan.durationValue);
        const contractNumber = await this.generateNumber(tenantId);
        const totalAmount = dto.totalAmount ?? Number(plan.charges);
        const discount = plan.renewalDiscount ? totalAmount * (Number(plan.renewalDiscount) / 100) : 0;
        const finalAmount = totalAmount - discount;
        return this.prisma.working.aMCContract.create({
            data: {
                tenantId,
                amcPlanId: contract.amcPlanId,
                contractNumber,
                customerId: contract.customerId,
                customerType: contract.customerType,
                customerName: contract.customerName,
                productIds: contract.productIds ?? [],
                serialIds: contract.serialIds ?? [],
                startDate: newStart,
                endDate: newEnd,
                status: 'DRAFT',
                totalAmount: finalAmount,
                paidAmount: 0,
                balanceAmount: finalAmount,
                billingCycle: plan.billingCycle,
                freeVisitsTotal: plan.freeVisits,
                freeCallsTotal: plan.freeCallSupport,
                freeOnlineTotal: plan.freeOnlineSupport,
                renewedFromId: id,
                autoRenew: contract.autoRenew,
            },
            include: { plan: true },
        });
    }
};
exports.AMCContractService = AMCContractService;
exports.AMCContractService = AMCContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AMCContractService);
//# sourceMappingURL=amc-contract.service.js.map