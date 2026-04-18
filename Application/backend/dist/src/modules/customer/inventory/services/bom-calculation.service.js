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
exports.BOMCalculationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let BOMCalculationService = class BOMCalculationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkStock(tenantId, formulaId, quantity, locationId) {
        const formula = await this.prisma.working.bOMFormula.findFirst({
            where: { id: formulaId, tenantId },
            include: {
                items: { include: { rawMaterial: true }, orderBy: { sortOrder: 'asc' } },
                finishedProduct: true,
            },
        });
        if (!formula)
            throw new common_1.NotFoundException('Recipe not found');
        const results = [];
        let canProduce = true;
        let maxProducible = Infinity;
        for (const item of formula.items) {
            const effectiveQty = Number(item.effectiveQuantity ?? item.quantity);
            const required = effectiveQty * quantity;
            const summary = await this.prisma.working.stockSummary.findFirst({
                where: { tenantId, inventoryItemId: item.rawMaterialId, locationId },
            });
            const available = summary?.currentStock ?? 0;
            const sufficient = available >= required;
            if (!sufficient && item.isCritical) {
                canProduce = false;
                const possibleFromThis = effectiveQty > 0
                    ? Math.floor(available / effectiveQty)
                    : 0;
                maxProducible = Math.min(maxProducible, possibleFromThis);
            }
            results.push({
                rawMaterialId: item.rawMaterialId,
                rawMaterialName: item.rawMaterial?.defaultUnit
                    ? `${item.rawMaterialId}`
                    : item.rawMaterialId,
                requiredQty: Math.round(required * 1000) / 1000,
                availableQty: available,
                unit: item.unit,
                sufficient,
                shortageQty: sufficient ? 0 : Math.round((required - available) * 1000) / 1000,
                isCritical: item.isCritical,
                substituteAvailable: !!item.substituteProductId,
            });
        }
        const estimatedCost = await this.calculateCost(tenantId, formulaId, quantity);
        return {
            formulaId,
            formulaName: formula.formulaName,
            requestedQuantity: quantity,
            canProduce,
            maxProducible: canProduce ? quantity : (maxProducible === Infinity ? 0 : maxProducible),
            shortage: results.filter((r) => !r.sufficient),
            allItems: results,
            estimatedCost,
        };
    }
    async calculateCost(tenantId, formulaId, quantity) {
        const formula = await this.prisma.working.bOMFormula.findFirst({
            where: { id: formulaId, tenantId },
            include: { items: { include: { rawMaterial: true } } },
        });
        if (!formula)
            throw new common_1.NotFoundException('Recipe not found');
        let totalRawMaterialCost = 0;
        const breakdown = [];
        for (const item of formula.items) {
            const effectiveQty = Number(item.effectiveQuantity ?? item.quantity);
            const requiredQty = effectiveQty * quantity;
            const unitCost = Number(item.rawMaterial?.avgCostPrice ?? 0);
            const lineCost = unitCost * requiredQty;
            totalRawMaterialCost += lineCost;
            breakdown.push({
                rawMaterialId: item.rawMaterialId,
                requiredQty: Math.round(requiredQty * 1000) / 1000,
                unit: item.unit,
                unitCost,
                lineCost: Math.round(lineCost * 100) / 100,
            });
        }
        const costPerUnit = quantity > 0 ? totalRawMaterialCost / quantity : 0;
        const avgWastage = formula.items.length > 0
            ? formula.items.reduce((sum, i) => sum + Number(i.wastagePercent ?? 0), 0) / formula.items.length
            : 0;
        return {
            totalRawMaterialCost: Math.round(totalRawMaterialCost * 100) / 100,
            costPerUnit: Math.round(costPerUnit * 100) / 100,
            quantity,
            wastagePercent: Math.round(avgWastage * 100) / 100,
            breakdown,
            suggestedMRP2x: Math.ceil(costPerUnit * 2),
            suggestedMRP3x: Math.ceil(costPerUnit * 3),
        };
    }
};
exports.BOMCalculationService = BOMCalculationService;
exports.BOMCalculationService = BOMCalculationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BOMCalculationService);
//# sourceMappingURL=bom-calculation.service.js.map