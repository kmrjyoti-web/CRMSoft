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
exports.AdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const transaction_service_1 = require("./transaction.service");
let AdjustmentService = class AdjustmentService {
    constructor(prisma, transactionService) {
        this.prisma = prisma;
        this.transactionService = transactionService;
    }
    async create(tenantId, dto) {
        return this.prisma.working.stockAdjustment.create({
            data: {
                tenantId,
                productId: dto.productId,
                locationId: dto.locationId,
                adjustmentType: dto.adjustmentType,
                quantity: dto.quantity,
                reason: dto.reason,
                createdById: dto.createdById,
            },
        });
    }
    async approve(tenantId, id, approvedById, action) {
        const adjustment = await this.prisma.working.stockAdjustment.findFirst({
            where: { id, tenantId },
        });
        if (!adjustment)
            throw new common_1.NotFoundException('Adjustment not found');
        if (adjustment.status !== 'ADJ_PENDING') {
            throw new common_1.BadRequestException('Adjustment already processed');
        }
        const status = action === 'approve' ? 'ADJ_APPROVED' : 'ADJ_REJECTED';
        const updated = await this.prisma.working.stockAdjustment.update({
            where: { id },
            data: {
                status: status,
                approvedById,
                approvedAt: new Date(),
            },
        });
        if (action === 'approve') {
            const txnType = adjustment.adjustmentType === 'INCREASE'
                ? 'ADJUSTMENT'
                : adjustment.adjustmentType === 'WRITE_OFF'
                    ? 'WRITE_OFF'
                    : 'ADJUSTMENT';
            const quantity = adjustment.adjustmentType === 'DECREASE' || adjustment.adjustmentType === 'WRITE_OFF'
                ? -Math.abs(adjustment.quantity)
                : Math.abs(adjustment.quantity);
            await this.transactionService.record(tenantId, {
                productId: adjustment.productId,
                transactionType: txnType,
                quantity: Math.abs(adjustment.quantity),
                locationId: adjustment.locationId,
                referenceType: 'ADJUSTMENT',
                referenceId: id,
                remarks: `Adjustment: ${adjustment.reason}`,
                createdById: approvedById,
            });
        }
        return updated;
    }
    async list(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 50;
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.working.stockAdjustment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.stockAdjustment.count({ where }),
        ]);
        return { data, total, page, limit };
    }
};
exports.AdjustmentService = AdjustmentService;
exports.AdjustmentService = AdjustmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_service_1.TransactionService])
], AdjustmentService);
//# sourceMappingURL=adjustment.service.js.map