import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WarrantyClaimService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.warrantyClaim.count({ where: { tenantId } });
    return `WC-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(tenantId: string, filters?: { status?: string; assignedToId?: string }) {
    return this.prisma.warrantyClaim.findMany({
      where: {
        tenantId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedToId && { assignedToId: filters.assignedToId }),
      },
      include: { warrantyRecord: { include: { template: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const claim = await this.prisma.warrantyClaim.findFirst({
      where: { id, tenantId },
      include: { warrantyRecord: { include: { template: true } } },
    });
    if (!claim) throw new NotFoundException('Warranty claim not found');
    return claim;
  }

  async create(tenantId: string, dto: any) {
    const record = await this.prisma.warrantyRecord.findFirst({
      where: { id: dto.warrantyRecordId, tenantId, status: { in: ['ACTIVE', 'EXTENDED'] } },
      include: { template: true },
    });
    if (!record) throw new NotFoundException('Active warranty record not found');

    const template = record.template;
    if (template.maxClaims) {
      if (record.claimsUsed >= template.maxClaims) {
        throw new BadRequestException(`Maximum claims (${template.maxClaims}) reached for this warranty`);
      }
    }

    const claimNumber = await this.generateNumber(tenantId);
    const [claim] = await this.prisma.$transaction([
      this.prisma.warrantyClaim.create({
        data: { ...dto, tenantId, claimNumber, status: 'OPEN' },
      }),
      this.prisma.warrantyRecord.update({
        where: { id: dto.warrantyRecordId },
        data: { claimsUsed: { increment: 1 } },
      }),
    ]);
    return claim;
  }

  async update(tenantId: string, id: string, dto: any) {
    const claim = await this.prisma.warrantyClaim.findFirst({ where: { id, tenantId } });
    if (!claim) throw new NotFoundException('Claim not found');
    return this.prisma.warrantyClaim.update({ where: { id }, data: dto });
  }

  async reject(tenantId: string, id: string, reason: string) {
    const claim = await this.prisma.warrantyClaim.findFirst({ where: { id, tenantId } });
    if (!claim) throw new NotFoundException('Claim not found');
    return this.prisma.warrantyClaim.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason, isCovered: false },
    });
  }
}
