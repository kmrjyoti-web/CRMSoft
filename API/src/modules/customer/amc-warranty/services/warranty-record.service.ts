import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WarrantyRecordService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.warrantyRecord.count({ where: { tenantId } });
    return `WR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(tenantId: string, filters?: { customerId?: string; productId?: string; status?: string }) {
    return this.prisma.warrantyRecord.findMany({
      where: {
        tenantId,
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { template: true, _count: { select: { claims: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const record = await this.prisma.warrantyRecord.findFirst({
      where: { id, tenantId },
      include: {
        template: true,
        claims: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!record) throw new NotFoundException('Warranty record not found');
    return record;
  }

  async findExpiring(tenantId: string, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.prisma.warrantyRecord.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        endDate: { lte: cutoff, gte: new Date() },
      },
      include: { template: true },
      orderBy: { endDate: 'asc' },
    });
  }

  async checkBySerial(tenantId: string, serialMasterId: string) {
    return this.prisma.warrantyRecord.findFirst({
      where: { tenantId, serialMasterId, status: 'ACTIVE' },
      include: { template: true },
    });
  }

  async extend(tenantId: string, id: string, dto: { months: number; reason?: string }) {
    const record = await this.prisma.warrantyRecord.findFirst({ where: { id, tenantId } });
    if (!record) throw new NotFoundException('Warranty record not found');
    const base = record.extendedUntil ?? record.endDate;
    const extended = new Date(base);
    extended.setMonth(extended.getMonth() + dto.months);
    return this.prisma.warrantyRecord.update({
      where: { id },
      data: { extendedUntil: extended, status: 'EXTENDED', notes: dto.reason },
    });
  }

  // Called by invoice payment hook (trigger: invoice status = PAID)
  async autoCreateFromInvoice(tenantId: string, invoice: any) {
    if (!invoice.lineItems?.length) return [];
    const created: any[] = [];

    for (const item of invoice.lineItems) {
      if (!item.productId) continue;

      const template = await this.prisma.warrantyTemplate.findFirst({
        where: {
          tenantId,
          OR: [
            { productId: item.productId },
            { applicationType: 'ALL_PRODUCTS' },
          ],
          isActive: true,
          isSystemTemplate: false,
        },
      });
      if (!template) continue;

      const startDate = new Date();
      const endDate = this.calcEndDate(startDate, template.durationValue, template.durationType);
      const warrantyNumber = await this.generateNumber(tenantId);

      const record = await this.prisma.warrantyRecord.create({
        data: {
          tenantId,
          warrantyTemplateId: template.id,
          warrantyNumber,
          customerId: invoice.contactId ?? invoice.organizationId ?? 'unknown',
          customerType: invoice.organizationId ? 'ORGANIZATION' : 'CONTACT',
          customerName: invoice.billingName,
          productId: item.productId,
          productName: item.productName,
          invoiceId: invoice.id,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      });
      created.push(record);
    }
    return created;
  }

  private calcEndDate(start: Date, value: number, type: string): Date {
    const end = new Date(start);
    if (type === 'DAYS') end.setDate(end.getDate() + value);
    else if (type === 'MONTHS') end.setMonth(end.getMonth() + value);
    else if (type === 'YEARS') end.setFullYear(end.getFullYear() + value);
    return end;
  }
}
