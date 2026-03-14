import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BOMCalculationService } from './bom-calculation.service';
import { TransactionService } from './transaction.service';
import { ScrapService } from './scrap.service';

@Injectable()
export class BOMProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculationService: BOMCalculationService,
    private readonly transactionService: TransactionService,
    private readonly scrapService: ScrapService,
  ) {}

  async startProduction(tenantId: string, userId: string, data: {
    formulaId: string;
    quantity: number;
    locationId: string;
    forcePartial?: boolean;
  }) {
    const check = await this.calculationService.checkStock(
      tenantId, data.formulaId, data.quantity, data.locationId,
    );

    if (!check.canProduce && !data.forcePartial) {
      throw new BadRequestException({
        message: `Cannot produce ${data.quantity}. Max possible: ${check.maxProducible}`,
        shortage: check.shortage,
        maxProducible: check.maxProducible,
      });
    }

    const produceQty = check.canProduce ? data.quantity : check.maxProducible;

    const production = await this.prisma.bOMProduction.create({
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

  async completeProduction(tenantId: string, userId: string, productionId: string, data: {
    actualQuantity?: number;
    locationId: string;
    scrapQuantity?: number;
    scrapReason?: string;
  }) {
    const production = await this.prisma.bOMProduction.findFirst({
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
    if (!production) throw new NotFoundException('Production run not found');
    if (production.status === 'COMPLETED') throw new BadRequestException('Production already completed');
    if (production.status === 'CANCELLED') throw new BadRequestException('Production was cancelled');

    const formula = production.formula;
    const quantity = data.actualQuantity ?? production.quantityOrdered;

    // 1. DEDUCT raw materials (PRODUCTION_OUT)
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

      // Record raw material wastage
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

    // 2. ADD finished product (PRODUCTION_IN)
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

    // 3. Record finished product scrap if any
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

    // 4. Update production record
    const updated = await this.prisma.bOMProduction.update({
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

  async findAll(tenantId: string, filters?: {
    status?: string;
    formulaId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.formulaId) where.formulaId = filters.formulaId;
    if (filters?.startDate || filters?.endDate) {
      where.productionDate = {};
      if (filters?.startDate) where.productionDate.gte = new Date(filters.startDate);
      if (filters?.endDate) where.productionDate.lte = new Date(filters.endDate);
    }

    return this.prisma.bOMProduction.findMany({
      where,
      include: { formula: { include: { finishedProduct: true } } },
      orderBy: { productionDate: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const production = await this.prisma.bOMProduction.findFirst({
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
    if (!production) throw new NotFoundException('Production run not found');

    // Get related scrap records
    const scrapRecords = await this.prisma.scrapRecord.findMany({
      where: { tenantId, bomProductionId: id },
    });

    // Get related transactions
    const transactions = await this.prisma.stockTransaction.findMany({
      where: { tenantId, bomProductionId: id },
      orderBy: { transactionDate: 'asc' },
    });

    return { ...production, scrapRecords, transactions };
  }

  async cancel(tenantId: string, id: string, reason: string) {
    const production = await this.prisma.bOMProduction.findFirst({
      where: { id, tenantId },
    });
    if (!production) throw new NotFoundException('Production run not found');
    if (production.status === 'COMPLETED') throw new BadRequestException('Cannot cancel completed production');

    return this.prisma.bOMProduction.update({
      where: { id },
      data: { status: 'CANCELLED', scrapReason: reason },
    });
  }
}
