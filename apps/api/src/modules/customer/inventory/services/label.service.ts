import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class InventoryLabelService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.working.inventoryLabel.findMany({
      orderBy: { industryCode: 'asc' },
    });
  }

  async getByIndustry(industryCode: string) {
    return this.prisma.working.inventoryLabel.findUnique({
      where: { industryCode },
    });
  }

  async upsert(dto: {
    industryCode: string;
    serialNoLabel?: string;
    code1Label?: string;
    code2Label?: string;
    expiryLabel?: string;
    stockInLabel?: string;
    stockOutLabel?: string;
    locationLabel?: string;
  }) {
    return this.prisma.working.inventoryLabel.upsert({
      where: { industryCode: dto.industryCode },
      create: dto,
      update: {
        serialNoLabel: dto.serialNoLabel,
        code1Label: dto.code1Label,
        code2Label: dto.code2Label,
        expiryLabel: dto.expiryLabel,
        stockInLabel: dto.stockInLabel,
        stockOutLabel: dto.stockOutLabel,
        locationLabel: dto.locationLabel,
      },
    });
  }
}
