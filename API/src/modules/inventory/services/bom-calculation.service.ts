import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class BOMCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async checkStock(tenantId: string, formulaId: string, quantity: number, locationId: string) {
    const formula = await this.prisma.bOMFormula.findFirst({
      where: { id: formulaId, tenantId },
      include: {
        items: { include: { rawMaterial: true }, orderBy: { sortOrder: 'asc' } },
        finishedProduct: true,
      },
    });
    if (!formula) throw new NotFoundException('Recipe not found');

    const results: Array<{
      rawMaterialId: string;
      rawMaterialName: string;
      requiredQty: number;
      availableQty: number;
      unit: string;
      sufficient: boolean;
      shortageQty: number;
      isCritical: boolean;
      substituteAvailable: boolean;
    }> = [];

    let canProduce = true;
    let maxProducible = Infinity;

    for (const item of formula.items) {
      const effectiveQty = Number(item.effectiveQuantity ?? item.quantity);
      const required = effectiveQty * quantity;

      // Get current stock at this location
      const summary = await this.prisma.stockSummary.findFirst({
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

  async calculateCost(tenantId: string, formulaId: string, quantity: number) {
    const formula = await this.prisma.bOMFormula.findFirst({
      where: { id: formulaId, tenantId },
      include: { items: { include: { rawMaterial: true } } },
    });
    if (!formula) throw new NotFoundException('Recipe not found');

    let totalRawMaterialCost = 0;
    const breakdown: Array<{
      rawMaterialId: string;
      requiredQty: number;
      unit: string;
      unitCost: number;
      lineCost: number;
    }> = [];

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
}
