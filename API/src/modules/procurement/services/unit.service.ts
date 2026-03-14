import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class UnitService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, category?: string) {
    const where: any = { tenantId };
    if (category) where.unitCategory = category;
    return this.prisma.unitMaster.findMany({
      where,
      orderBy: [{ unitCategory: 'asc' }, { name: 'asc' }],
    });
  }

  async getById(tenantId: string, id: string) {
    const unit = await this.prisma.unitMaster.findFirst({ where: { id, tenantId } });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async create(tenantId: string, dto: {
    name: string; symbol: string; category: string;
    baseMultiplier?: number; isBaseUnit?: boolean;
  }) {
    const existing = await this.prisma.unitMaster.findUnique({
      where: { tenantId_symbol: { tenantId, symbol: dto.symbol } },
    });
    if (existing) throw new BadRequestException(`Unit "${dto.symbol}" already exists`);

    return this.prisma.unitMaster.create({
      data: {
        tenantId,
        name: dto.name,
        symbol: dto.symbol,
        unitCategory: dto.category as any,
        isBase: dto.isBaseUnit ?? false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: { name?: string; symbol?: string }) {
    const unit = await this.prisma.unitMaster.findFirst({ where: { id, tenantId } });
    if (!unit) throw new NotFoundException('Unit not found');
    return this.prisma.unitMaster.update({ where: { id }, data: dto });
  }

  async delete(tenantId: string, id: string) {
    const unit = await this.prisma.unitMaster.findFirst({ where: { id, tenantId } });
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.isSystem) throw new BadRequestException('Cannot delete system unit');
    await this.prisma.unitMaster.delete({ where: { id } });
    return { deleted: true };
  }

  // ─── Conversions ───

  async listConversions(tenantId: string, productId?: string) {
    const where: any = { tenantId };
    if (productId) where.productId = productId;
    else where.productId = null;
    return this.prisma.unitConversion.findMany({ where });
  }

  async createConversion(tenantId: string, dto: {
    fromUnitId: string; toUnitId: string; factor: number; productId?: string;
  }) {
    return this.prisma.unitConversion.create({
      data: {
        tenantId,
        fromUnitId: dto.fromUnitId,
        toUnitId: dto.toUnitId,
        conversionFactor: dto.factor,
        productId: dto.productId,
      },
    });
  }

  async deleteConversion(tenantId: string, id: string) {
    const conv = await this.prisma.unitConversion.findFirst({ where: { id, tenantId } });
    if (!conv) throw new NotFoundException('Conversion not found');
    await this.prisma.unitConversion.delete({ where: { id } });
    return { deleted: true };
  }

  async calculate(tenantId: string, dto: {
    fromUnitId: string; toUnitId: string; quantity: number; productId?: string;
  }) {
    if (dto.fromUnitId === dto.toUnitId) {
      return { result: dto.quantity, factor: 1 };
    }

    // Try product-specific, then global
    let conversion = dto.productId
      ? await this.prisma.unitConversion.findFirst({
          where: { tenantId, fromUnitId: dto.fromUnitId, toUnitId: dto.toUnitId, productId: dto.productId },
        })
      : null;

    if (!conversion) {
      conversion = await this.prisma.unitConversion.findFirst({
        where: { tenantId, fromUnitId: dto.fromUnitId, toUnitId: dto.toUnitId, productId: null },
      });
    }

    // Try reverse
    if (!conversion) {
      const reverse = await this.prisma.unitConversion.findFirst({
        where: { tenantId, fromUnitId: dto.toUnitId, toUnitId: dto.fromUnitId },
      });
      if (reverse) {
        const factor = 1 / reverse.conversionFactor.toNumber();
        return { result: dto.quantity * factor, factor };
      }
    }

    if (!conversion) {
      throw new BadRequestException('No conversion found between these units');
    }

    const factor = conversion.conversionFactor.toNumber();
    return { result: dto.quantity * factor, factor };
  }
}
