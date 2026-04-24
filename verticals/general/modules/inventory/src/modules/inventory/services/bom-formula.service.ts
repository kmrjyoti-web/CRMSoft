import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class BOMFormulaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: {
    formulaName: string;
    formulaCode?: string;
    finishedProductId: string;
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTime?: number;
    cookTime?: number;
    instructions?: string;
    industryCode?: string;
    items: Array<{
      rawMaterialId: string;
      quantity: number;
      unit: string;
      wastagePercent?: number;
      isCritical?: boolean;
      substituteProductId?: string;
      sortOrder?: number;
    }>;
  }) {
    const code = data.formulaCode || await this.generateCode(tenantId);

    // Check for duplicate code
    const existing = await this.prisma.working.bOMFormula.findFirst({
      where: { tenantId, formulaCode: code },
    });
    if (existing) throw new BadRequestException(`Formula code "${code}" already exists`);

    const formula = await this.prisma.working.bOMFormula.create({
      data: {
        tenantId,
        formulaName: data.formulaName,
        formulaCode: code,
        finishedProductId: data.finishedProductId,
        yieldQuantity: data.yieldQuantity ?? 1,
        yieldUnit: data.yieldUnit ?? 'piece',
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        instructions: data.instructions,
        industryCode: data.industryCode,
        items: {
          create: data.items.map((item, idx) => {
            const wastage = item.wastagePercent ?? 0;
            const effectiveQty = item.quantity * (1 + wastage / 100);
            return {
              tenantId,
              rawMaterialId: item.rawMaterialId,
              quantity: item.quantity,
              unit: item.unit,
              wastagePercent: wastage,
              effectiveQuantity: Math.round(effectiveQty * 1000) / 1000,
              isCritical: item.isCritical ?? true,
              substituteProductId: item.substituteProductId,
              sortOrder: item.sortOrder ?? idx,
            };
          }),
        },
      },
      include: { items: true, finishedProduct: true },
    });

    // Mark finished product
    await this.prisma.working.inventoryItem.updateMany({
      where: { id: data.finishedProductId, tenantId },
      data: { isFinishedProduct: true },
    });

    // Mark raw materials
    const rawMaterialIds = data.items.map((i) => i.rawMaterialId);
    await this.prisma.working.inventoryItem.updateMany({
      where: { id: { in: rawMaterialIds }, tenantId },
      data: { isRawMaterial: true },
    });

    return formula;
  }

  async findAll(tenantId: string, filters?: {
    productId?: string;
    industryCode?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.productId) where.finishedProductId = filters.productId;
    if (filters?.industryCode) where.industryCode = filters.industryCode;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { formulaName: { contains: filters.search, mode: 'insensitive' } },
        { formulaCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.working.bOMFormula.findMany({
      where,
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        finishedProduct: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const formula = await this.prisma.working.bOMFormula.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { rawMaterial: true },
        },
        finishedProduct: true,
      },
    });
    if (!formula) throw new NotFoundException('Recipe not found');

    // Enrich items with current stock
    const enrichedItems = await Promise.all(
      formula.items.map(async (item) => {
        const summaries = await this.prisma.working.stockSummary.findMany({
          where: { tenantId, inventoryItemId: item.rawMaterialId },
        });
        const totalStock = summaries.reduce((sum, s) => sum + s.currentStock, 0);
        return {
          ...item,
          currentStock: totalStock,
        };
      }),
    );

    return { ...formula, items: enrichedItems };
  }

  async update(tenantId: string, id: string, data: {
    formulaName?: string;
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTime?: number;
    cookTime?: number;
    instructions?: string;
    industryCode?: string;
    items?: Array<{
      rawMaterialId: string;
      quantity: number;
      unit: string;
      wastagePercent?: number;
      isCritical?: boolean;
      substituteProductId?: string;
      sortOrder?: number;
    }>;
  }) {
    const existing = await this.prisma.working.bOMFormula.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Recipe not found');

    // Version: deactivate old, create new version
    if (data.items) {
      await this.prisma.working.bOMFormula.update({
        where: { id },
        data: { isActive: false },
      });

      const newVersion = existing.version + 1;
      const newCode = `${existing.formulaCode}-v${newVersion}`;

      return this.create(tenantId, {
        formulaName: data.formulaName ?? existing.formulaName,
        formulaCode: newCode,
        finishedProductId: existing.finishedProductId,
        yieldQuantity: data.yieldQuantity ?? Number(existing.yieldQuantity),
        yieldUnit: data.yieldUnit ?? existing.yieldUnit,
        prepTime: data.prepTime ?? existing.prepTime ?? undefined,
        cookTime: data.cookTime ?? existing.cookTime ?? undefined,
        instructions: data.instructions ?? existing.instructions ?? undefined,
        industryCode: data.industryCode ?? existing.industryCode ?? undefined,
        items: data.items,
      });
    }

    // Simple update (no item changes)
    const updateData: any = {};
    if (data.formulaName) updateData.formulaName = data.formulaName;
    if (data.yieldQuantity) updateData.yieldQuantity = data.yieldQuantity;
    if (data.yieldUnit) updateData.yieldUnit = data.yieldUnit;
    if (data.prepTime !== undefined) updateData.prepTime = data.prepTime;
    if (data.cookTime !== undefined) updateData.cookTime = data.cookTime;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.industryCode) updateData.industryCode = data.industryCode;

    return this.prisma.working.bOMFormula.update({
      where: { id },
      data: updateData,
      include: { items: { orderBy: { sortOrder: 'asc' } }, finishedProduct: true },
    });
  }

  async duplicate(tenantId: string, id: string, newName: string) {
    const original = await this.prisma.working.bOMFormula.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!original) throw new NotFoundException('Recipe not found');

    return this.create(tenantId, {
      formulaName: newName,
      finishedProductId: original.finishedProductId,
      yieldQuantity: Number(original.yieldQuantity),
      yieldUnit: original.yieldUnit,
      prepTime: original.prepTime ?? undefined,
      cookTime: original.cookTime ?? undefined,
      instructions: original.instructions ?? undefined,
      industryCode: original.industryCode ?? undefined,
      items: original.items.map((item) => ({
        rawMaterialId: item.rawMaterialId,
        quantity: Number(item.quantity),
        unit: item.unit,
        wastagePercent: item.wastagePercent ? Number(item.wastagePercent) : undefined,
        isCritical: item.isCritical,
        substituteProductId: item.substituteProductId ?? undefined,
        sortOrder: item.sortOrder,
      })),
    });
  }

  async deactivate(tenantId: string, id: string) {
    const formula = await this.prisma.working.bOMFormula.findFirst({ where: { id, tenantId } });
    if (!formula) throw new NotFoundException('Recipe not found');

    return this.prisma.working.bOMFormula.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async generateCode(tenantId: string): Promise<string> {
    const count = await this.prisma.working.bOMFormula.count({ where: { tenantId } });
    return `BOM-${String(count + 1).padStart(4, '0')}`;
  }
}
