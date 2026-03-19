import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ScrapService {
  constructor(private readonly prisma: PrismaService) {}

  async recordScrap(tenantId: string, userId: string, data: {
    productId: string;
    scrapType: string;
    quantity: number;
    reason: string;
    locationId?: string;
    bomProductionId?: string;
    serialMasterId?: string;
    batchId?: string;
    unitCost?: number;
    isRawMaterial?: boolean;
    isFinishedProduct?: boolean;
    disposalMethod?: string;
  }) {
    const totalLoss = data.unitCost ? data.unitCost * data.quantity : undefined;

    const scrap = await this.prisma.scrapRecord.create({
      data: {
        tenantId,
        productId: data.productId,
        scrapType: data.scrapType as any,
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

    // Auto-transfer to scrap store if location has one
    if (data.locationId) {
      const scrapStore = await this.prisma.stockLocation.findFirst({
        where: {
          tenantId,
          type: 'SCRAP_STORE',
          code: { endsWith: '-S' },
          isActive: true,
        },
      });

      if (scrapStore) {
        // Record scrap transaction — just track the scrap, don't double-deduct
        await this.prisma.stockTransaction.create({
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

  async findAll(tenantId: string, filters?: {
    scrapType?: string;
    productId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
    isRawMaterial?: boolean;
    isFinishedProduct?: boolean;
  }) {
    const where: any = { tenantId };
    if (filters?.scrapType) where.scrapType = filters.scrapType;
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.locationId) where.locationId = filters.locationId;
    if (filters?.isRawMaterial !== undefined) where.isRawMaterial = filters.isRawMaterial;
    if (filters?.isFinishedProduct !== undefined) where.isFinishedProduct = filters.isFinishedProduct;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters?.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.scrapRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReport(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const records = await this.prisma.scrapRecord.findMany({ where });

    const totalScrapValue = records.reduce((sum, r) => sum + Number(r.totalLoss ?? 0), 0);

    // Group by type
    const byType: Record<string, number> = {};
    for (const r of records) {
      const type = r.scrapType;
      byType[type] = (byType[type] ?? 0) + Number(r.totalLoss ?? 0);
    }

    // Group by product
    const byProduct: Record<string, { quantity: number; value: number }> = {};
    for (const r of records) {
      if (!byProduct[r.productId]) byProduct[r.productId] = { quantity: 0, value: 0 };
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

  async writeOff(tenantId: string, id: string, disposalMethod?: string) {
    const scrap = await this.prisma.scrapRecord.findFirst({ where: { id, tenantId } });
    if (!scrap) throw new NotFoundException('Scrap record not found');

    return this.prisma.scrapRecord.update({
      where: { id },
      data: { disposalMethod: disposalMethod || 'WRITTEN_OFF' },
    });
  }
}
