import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { InventoryService } from './inventory.service';

@Injectable()
export class SerialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async list(tenantId: string, filters: {
    productId?: string;
    status?: string;
    locationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const where: any = { tenantId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.status) where.status = filters.status;
    if (filters.locationId) where.locationId = filters.locationId;

    const [data, total] = await Promise.all([
      this.prisma.working.serialMaster.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { inventoryItem: true },
      }),
      this.prisma.working.serialMaster.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const serial = await this.prisma.working.serialMaster.findFirst({
      where: { id, tenantId },
      include: { inventoryItem: true },
    });
    if (!serial) throw new NotFoundException('Serial not found');
    return serial;
  }

  async create(tenantId: string, dto: {
    productId: string;
    serialNo: string;
    code1?: string;
    code2?: string;
    batchNo?: string;
    expiryType?: string;
    expiryValue?: number;
    expiryDate?: string;
    mrp?: number;
    purchaseRate?: number;
    saleRate?: number;
    costPrice?: number;
    taxType?: string;
    taxRate?: number;
    hsnCode?: string;
    locationId?: string;
    customFields?: any;
    industryCode?: string;
  }) {
    // Ensure inventory item exists
    const item = await this.inventoryService.getOrCreateItem(tenantId, dto.productId, 'SERIAL');

    // Check duplicate serial
    const existing = await this.prisma.working.serialMaster.findUnique({
      where: { tenantId_serialNo: { tenantId, serialNo: dto.serialNo } },
    });
    if (existing) throw new BadRequestException(`Serial number "${dto.serialNo}" already exists`);

    const serial = await this.prisma.working.serialMaster.create({
      data: {
        tenantId,
        productId: dto.productId,
        inventoryItemId: item.id,
        serialNo: dto.serialNo,
        code1: dto.code1,
        code2: dto.code2,
        batchNo: dto.batchNo,
        expiryType: (dto.expiryType as any) ?? 'NEVER',
        expiryValue: dto.expiryValue,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        mrp: dto.mrp,
        purchaseRate: dto.purchaseRate,
        saleRate: dto.saleRate,
        costPrice: dto.costPrice,
        taxType: dto.taxType as any,
        taxRate: dto.taxRate,
        hsnCode: dto.hsnCode,
        locationId: dto.locationId,
        customFields: dto.customFields,
        industryCode: dto.industryCode,
      },
    });

    // Update stock count
    await this.prisma.working.inventoryItem.update({
      where: { id: item.id },
      data: { currentStock: { increment: 1 } },
    });

    return serial;
  }

  async bulkCreate(tenantId: string, items: Array<{
    productId: string;
    serialNo: string;
    code1?: string;
    code2?: string;
    batchNo?: string;
    expiryType?: string;
    expiryValue?: number;
    expiryDate?: string;
    mrp?: number;
    purchaseRate?: number;
    saleRate?: number;
    costPrice?: number;
    locationId?: string;
    industryCode?: string;
  }>) {
    const results: any[] = [];
    const errors: any[] = [];

    // Group by productId to batch inventory item creation
    const productIds = [...new Set(items.map((i) => i.productId))];
    const itemMap: Record<string, string> = {};

    for (const productId of productIds) {
      const invItem = await this.inventoryService.getOrCreateItem(tenantId, productId, 'SERIAL');
      itemMap[productId] = invItem.id;
    }

    for (let idx = 0; idx < items.length; idx++) {
      const dto = items[idx];
      try {
        const existing = await this.prisma.working.serialMaster.findUnique({
          where: { tenantId_serialNo: { tenantId, serialNo: dto.serialNo } },
        });
        if (existing) {
          errors.push({ row: idx + 1, serialNo: dto.serialNo, error: 'Duplicate serial number' });
          continue;
        }

        const serial = await this.prisma.working.serialMaster.create({
          data: {
            tenantId,
            productId: dto.productId,
            inventoryItemId: itemMap[dto.productId],
            serialNo: dto.serialNo,
            code1: dto.code1,
            code2: dto.code2,
            batchNo: dto.batchNo,
            expiryType: (dto.expiryType as any) ?? 'NEVER',
            expiryValue: dto.expiryValue,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
            mrp: dto.mrp,
            purchaseRate: dto.purchaseRate,
            saleRate: dto.saleRate,
            costPrice: dto.costPrice,
            locationId: dto.locationId,
            industryCode: dto.industryCode,
          },
        });
        results.push(serial);
      } catch (err: any) {
        errors.push({ row: idx + 1, serialNo: dto.serialNo, error: err.message });
      }
    }

    // Update stock counts
    for (const productId of productIds) {
      const count = results.filter((r) => r.productId === productId).length;
      if (count > 0) {
        await this.prisma.working.inventoryItem.update({
          where: { id: itemMap[productId] },
          data: { currentStock: { increment: count } },
        });
      }
    }

    return { created: results.length, errors, total: items.length };
  }

  async update(tenantId: string, id: string, dto: {
    code1?: string;
    code2?: string;
    batchNo?: string;
    expiryType?: string;
    expiryValue?: number;
    expiryDate?: string;
    mrp?: number;
    purchaseRate?: number;
    saleRate?: number;
    costPrice?: number;
    taxType?: string;
    taxRate?: number;
    hsnCode?: string;
    locationId?: string;
    customFields?: any;
    metadata?: any;
  }) {
    const serial = await this.getById(tenantId, id);

    return this.prisma.working.serialMaster.update({
      where: { id: serial.id },
      data: {
        code1: dto.code1,
        code2: dto.code2,
        batchNo: dto.batchNo,
        expiryType: dto.expiryType as any,
        expiryValue: dto.expiryValue,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        mrp: dto.mrp,
        purchaseRate: dto.purchaseRate,
        saleRate: dto.saleRate,
        costPrice: dto.costPrice,
        taxType: dto.taxType as any,
        taxRate: dto.taxRate,
        hsnCode: dto.hsnCode,
        locationId: dto.locationId,
        customFields: dto.customFields,
        metadata: dto.metadata,
      },
    });
  }

  async changeStatus(tenantId: string, id: string, status: string, customerId?: string, invoiceId?: string) {
    const serial = await this.getById(tenantId, id);

    const updateData: any = { status };

    if (status === 'SOLD') {
      updateData.soldDate = new Date();
      if (customerId) updateData.customerId = customerId;
      if (invoiceId) updateData.invoiceId = invoiceId;
    } else if (status === 'ACTIVATED') {
      updateData.activationDate = new Date();
    }

    return this.prisma.working.serialMaster.update({
      where: { id: serial.id },
      data: updateData,
    });
  }

  async search(tenantId: string, query: string) {
    const q = query.trim();
    if (!q) return [];

    return this.prisma.working.serialMaster.findMany({
      where: {
        tenantId,
        OR: [
          { serialNo: { contains: q, mode: 'insensitive' } },
          { code1: { contains: q, mode: 'insensitive' } },
          { code2: { contains: q, mode: 'insensitive' } },
          { batchNo: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 50,
      include: { inventoryItem: true },
    });
  }

  async getExpiring(tenantId: string, days: number = 30) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return this.prisma.working.serialMaster.findMany({
      where: {
        tenantId,
        status: 'AVAILABLE',
        expiryDate: {
          not: null,
          lte: futureDate,
        },
      },
      orderBy: { expiryDate: 'asc' },
      include: { inventoryItem: true },
    });
  }
}
