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
exports.ScrapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ScrapService = class ScrapService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordScrap(tenantId, userId, data) {
        const totalLoss = data.unitCost ? data.unitCost * data.quantity : undefined;
        const scrap = await this.prisma.working.scrapRecord.create({
            data: {
                tenantId,
                productId: data.productId,
                scrapType: data.scrapType,
                quantity: data.quantity,
                unitCost: data.unitCost,
                totalLoss,
                reason: data.reason,
                locationId: data.locationId,
                bomProductionId: data.bomProductionId,
                serialMasterId: data.serialMasterId,
                batchId: data.batchId,
                isRawMaterial: data.isRawMaterial ?? false,
                isFinishedProduct: data.isFinishedProduct ?? false,
                disposalMethod: data.disposalMethod,
                createdById: userId,
            },
        });
        if (data.locationId) {
            const scrapStore = await this.prisma.working.stockLocation.findFirst({
                where: {
                    tenantId,
                    type: 'SCRAP_STORE',
                    code: { endsWith: '-S' },
                    isActive: true,
                },
            });
            if (scrapStore) {
                await this.prisma.working.stockTransaction.create({
                    data: {
                        tenantId,
                        inventoryItemId: data.productId,
                        productId: data.productId,
                        transactionType: 'SCRAP',
                        quantity: -data.quantity,
                        unitPrice: data.unitCost,
                        totalAmount: totalLoss,
                        locationId: data.locationId,
                        toLocationId: scrapStore.id,
                        referenceType: 'SCRAP_RECORD',
                        referenceId: scrap.id,
                        remarks: `Scrap: ${data.reason}`,
                        createdById: userId,
                    },
                });
            }
        }
        return scrap;
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.scrapType)
            where.scrapType = filters.scrapType;
        if (filters?.productId)
            where.productId = filters.productId;
        if (filters?.locationId)
            where.locationId = filters.locationId;
        if (filters?.isRawMaterial !== undefined)
            where.isRawMaterial = filters.isRawMaterial;
        if (filters?.isFinishedProduct !== undefined)
            where.isFinishedProduct = filters.isFinishedProduct;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters?.startDate)
                where.createdAt.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.createdAt.lte = new Date(filters.endDate);
        }
        return this.prisma.working.scrapRecord.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getReport(tenantId, startDate, endDate) {
        const where = { tenantId };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const records = await this.prisma.working.scrapRecord.findMany({ where });
        const totalScrapValue = records.reduce((sum, r) => sum + Number(r.totalLoss ?? 0), 0);
        const byType = {};
        for (const r of records) {
            const type = r.scrapType;
            byType[type] = (byType[type] ?? 0) + Number(r.totalLoss ?? 0);
        }
        const byProduct = {};
        for (const r of records) {
            if (!byProduct[r.productId])
                byProduct[r.productId] = { quantity: 0, value: 0 };
            byProduct[r.productId].quantity += r.quantity;
            byProduct[r.productId].value += Number(r.totalLoss ?? 0);
        }
        const rawMaterialWaste = records.filter((r) => r.isRawMaterial);
        const finishedProductWaste = records.filter((r) => r.isFinishedProduct);
        return {
            totalScrapValue: Math.round(totalScrapValue * 100) / 100,
            totalRecords: records.length,
            scrapByType: Object.entries(byType).map(([type, value]) => ({ type, value: Math.round(value * 100) / 100 })),
            scrapByProduct: Object.entries(byProduct).map(([productId, data]) => ({
                productId, quantity: data.quantity, value: Math.round(data.value * 100) / 100,
            })),
            rawMaterialWasteCount: rawMaterialWaste.length,
            finishedProductWasteCount: finishedProductWaste.length,
        };
    }
    async writeOff(tenantId, id, disposalMethod) {
        const scrap = await this.prisma.working.scrapRecord.findFirst({ where: { id, tenantId } });
        if (!scrap)
            throw new common_1.NotFoundException('Scrap record not found');
        return this.prisma.working.scrapRecord.update({
            where: { id },
            data: { disposalMethod: disposalMethod || 'WRITTEN_OFF' },
        });
    }
};
exports.ScrapService = ScrapService;
exports.ScrapService = ScrapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScrapService);
//# sourceMappingURL=scrap.service.js.map