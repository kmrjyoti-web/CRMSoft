import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.working.stockLocation.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, dto: {
    name: string;
    code: string;
    type?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactPerson?: string;
    phone?: string;
    isDefault?: boolean;
  }) {
    const existing = await this.prisma.working.stockLocation.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) throw new BadRequestException(`Location code "${dto.code}" already exists`);

    if (dto.isDefault) {
      await this.prisma.working.stockLocation.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const mainLocation = await this.prisma.working.stockLocation.create({
      data: { tenantId, ...dto },
    });

    // Auto-create expiry and scrap sub-stores
    const subStores = [
      { suffix: '-E', name: `${dto.name} (Expiry)`, type: 'EXPIRY_STORE' },
      { suffix: '-S', name: `${dto.name} (Scrap)`, type: 'SCRAP_STORE' },
    ];

    for (const sub of subStores) {
      const subCode = `${dto.code}${sub.suffix}`;
      const existing = await this.prisma.working.stockLocation.findUnique({
        where: { tenantId_code: { tenantId, code: subCode } },
      });
      if (!existing) {
        await this.prisma.working.stockLocation.create({
          data: {
            tenantId,
            name: sub.name,
            code: subCode,
            type: sub.type,
            address: dto.address,
            city: dto.city,
            state: dto.state,
            pincode: dto.pincode,
            parentLocationId: mainLocation.id,
          },
        });
      }
    }

    return mainLocation;
  }

  async update(tenantId: string, id: string, dto: {
    name?: string;
    type?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactPerson?: string;
    phone?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }) {
    const loc = await this.prisma.working.stockLocation.findFirst({ where: { id, tenantId } });
    if (!loc) throw new NotFoundException('Location not found');

    if (dto.isDefault) {
      await this.prisma.working.stockLocation.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.working.stockLocation.update({
      where: { id },
      data: dto,
    });
  }
}
