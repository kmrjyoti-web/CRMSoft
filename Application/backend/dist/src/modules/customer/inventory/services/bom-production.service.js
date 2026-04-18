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
exports.BOMProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const bom_calculation_service_1 = require("./bom-calculation.service");
const transaction_service_1 = require("./transaction.service");
const scrap_service_1 = require("./scrap.service");
let BOMProductionService = class BOMProductionService {
    constructor(prisma, calculationService, transactionService, scrapService) {
        this.prisma = prisma;
        this.calculationService = calculationService;
        this.transactionService = transactionService;
        this.scrapService = scrapService;
    }
    async startProduction(tenantId, userId, data) {
        const check = await this.calculationService.checkStock(tenantId, data.formulaId, data.quantity, data.locationId);
        if (!check.canProduce && !data.forcePartial) {
            throw new common_1.BadRequestException({
                message: `Cannot produce ${data.quantity}. Max possible: ${check.maxProducible}`,
                shortage: check.shortage,
                maxProducible: check.maxProducible,
            });
        }
        const produceQty = check.canProduce ? data.quantity : check.maxProducible;
        const production = await this.prisma.working.bOMProduction.create({
            data: {
                tenantId,
                formulaId: data.formulaId,
                quantityOrdered: produceQty,
                quantityProduced: 0,
                status: 'PLANNED',
                productionDate: new Date(),
                createdById: userId,
            },
            include: { formula: { include: { finishedProduct: true } } },
        });
        return {
            ...production,
            stockCheck: check,
        };
    }
    async completeProduction(tenantId, userId, productionId, data) {
        const production = await this.prisma.working.bOMProduction.findFirst({
            where: { id: productionId, tenantId },
            include: {
                formula: {
                    include: {
                        items: { include: { rawMaterial: true } },
                        finishedProduct: true,
                    },
                },
            },
        });
        if (!production)
            throw new common_1.NotFoundException('Production run not found');
        if (production.status === 'COMPLETED')
            throw new common_1.BadRequestException('Production already completed');
        if (production.status === 'CANCELLED')
            throw new common_1.BadRequestException('Production was cancelled');
        const formula = production.formula;
        const quantity = data.actualQuantity ?? production.quantityOrdered;
        for (const item of formula.items) {
            const effectiveQty = Number(item.effectiveQuantity ?? item.quantity);
            const deductQty = effectiveQty * quantity;
            await this.transactionService.record(tenantId, {
                productId: item.rawMaterial?.productId ?? item.rawMaterialId,
                transactionType: 'PRODUCTION_OUT',
                quantity: deductQty,
                locationId: data.locationId,
                referenceType: 'BOM_PRODUCTION',
                referenceId: productionId,
                remarks: `Used in production of ${formula.formulaName} x${quantity}`,
                createdById: userId,
            });
            const wastagePercent = Number(item.wastagePercent ?? 0);
            if (wastagePercent > 0) {
                const wasteQty = Number(item.quantity) * quantity * wastagePercent / 100;
                await this.scrapService.recordScrap(tenantId, userId, {
                    productId: item.rawMaterial?.productId ?? item.rawMaterialId,
                    bomProductionId: productionId,
                    scrapType: 'SCRAP_PRODUCTION_WASTE',
                    quantity: Math.ceil(wasteQty),
                    reason: `${wastagePercent}% wastage from ${formula.formulaName}`,
                    locationId: data.locationId,
                    isRawMaterial: true,
                    unitCost: Number(item.rawMaterial?.avgCostPrice ?? 0),
                });
            }
        }
        await this.transactionService.record(tenantId, {
            productId: formula.finishedProduct?.productId ?? formula.finishedProductId,
            transactionType: 'PRODUCTION_IN',
            quantity,
            locationId: data.locationId,
            referenceType: 'BOM_PRODUCTION',
            referenceId: productionId,
            remarks: `Produced ${formula.formulaName} x${quantity}`,
            createdById: userId,
        });
        const scrapQty = data.scrapQuantity ?? 0;
        if (scrapQty > 0) {
            await this.scrapService.recordScrap(tenantId, userId, {
                productId: formula.finishedProduct?.productId ?? formula.finishedProductId,
                bomProductionId: productionId,
                scrapType: 'SCRAP_PRODUCTION_WASTE',
                quantity: scrapQty,
                reason: data.scrapReason || 'Production wastage',
                locationId: data.locationId,
                isFinishedProduct: true,
            });
        }
        const updated = await this.prisma.working.bOMProduction.update({
            where: { id: productionId },
            data: {
                quantityProduced: quantity,
                scrapQuantity: scrapQty,
                scrapReason: data.scrapReason,
                status: 'COMPLETED',
                completedDate: new Date(),
            },
            include: { formula: { include: { finishedProduct: true } } },
        });
        return {
            ...updated,
            summary: { produced: quantity, scrap: scrapQty, rawMaterialsDeducted: formula.items.length },
        };
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.formulaId)
            where.formulaId = filters.formulaId;
        if (filters?.startDate || filters?.endDate) {
            where.productionDate = {};
            if (filters?.startDate)
                where.productionDate.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.productionDate.lte = new Date(filters.endDate);
        }
        return this.prisma.working.bOMProduction.findMany({
            where,
            include: { formula: { include: { finishedProduct: true } } },
            orderBy: { productionDate: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const production = await this.prisma.working.bOMProduction.findFirst({
            where: { id, tenantId },
            include: {
                formula: {
                    include: {
                        items: { include: { rawMaterial: true }, orderBy: { sortOrder: 'asc' } },
                        finishedProduct: true,
                    },
                },
            },
        });
        if (!production)
            throw new common_1.NotFoundException('Production run not found');
        const scrapRecords = await this.prisma.working.scrapRecord.findMany({
            where: { tenantId, bomProductionId: id },
        });
        const transactions = await this.prisma.working.stockTransaction.findMany({
            where: { tenantId, bomProductionId: id },
            orderBy: { transactionDate: 'asc' },
        });
        return { ...production, scrapRecords, transactions };
    }
    async cancel(tenantId, id, reason) {
        const production = await this.prisma.working.bOMProduction.findFirst({
            where: { id, tenantId },
        });
        if (!production)
            throw new common_1.NotFoundException('Production run not found');
        if (production.status === 'COMPLETED')
            throw new common_1.BadRequestException('Cannot cancel completed production');
        return this.prisma.working.bOMProduction.update({
            where: { id },
            data: { status: 'CANCELLED', scrapReason: reason },
        });
    }
};
exports.BOMProductionService = BOMProductionService;
exports.BOMProductionService = BOMProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bom_calculation_service_1.BOMCalculationService,
        transaction_service_1.TransactionService,
        scrap_service_1.ScrapService])
], BOMProductionService);
//# sourceMappingURL=bom-production.service.js.map