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

    const scrap = await this.prisma.working.scrapRecord.create({
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
      const scrapStore = await this.prisma.working.stockLocation.findFirst({
        where: {
          tenantId,
          type: 'SCRAP_STORE',
          code: { endsWith: '-S' },
          isActive: true,
        },
      });

      if (scrapStore) {
