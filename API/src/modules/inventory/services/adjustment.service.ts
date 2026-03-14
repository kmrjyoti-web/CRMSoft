import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TransactionService } from './transaction.service';

@Injectable()
export class AdjustmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(tenantId: string, dto: {
    productId: string;
    locationId: string;
    adjustmentType: string;
    quantity: number;
    reason: string;
    createdById: string;
  }) {
    return this.prisma.stockAdjustment.create({
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

  async approve(tenantId: string, id: string, approvedById: string, action: 'approve' | 'reject') {
    const adjustment = await this.prisma.stockAdjustment.findFirst({
      where: { id, tenantId },
    });
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    if (adjustment.status !== 'ADJ_PENDING') {
      throw new BadRequestException('Adjustment already processed');
    }

    const status = action === 'approve' ? 'ADJ_APPROVED' : 'ADJ_REJECTED';

    const updated = await this.prisma.stockAdjustment.update({
      where: { id },
      data: {
        status: status as any,
        approvedById,
        approvedAt: new Date(),
      },
    });

    // If approved, create a stock transaction
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

  async list(tenantId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.stockAdjustment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.stockAdjustment.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
