import { Injectable, Logger, HttpException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

@Injectable()
export class PartnerManagerService {
  private readonly logger = new Logger(PartnerManagerService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async list(filters?: { isActive?: boolean; brandCode?: string }) {
    return this.db.partnerRegistry.findMany({
      where: filters,
      include: {
        brand: { select: { brandCode: true, brandName: true, primaryColor: true } },
        verticalAccess: true,
      },
      orderBy: { partnerName: 'asc' },
    });
  }

  async getByCode(partnerCode: string) {
    return this.db.partnerRegistry.findUnique({
      where: { partnerCode },
      include: {
        brand: true,
        verticalAccess: true,
      },
    });
  }

  async create(dto: CreatePartnerDto, createdBy?: string) {
    const existing = await this.db.partnerRegistry.findUnique({ where: { partnerCode: dto.partnerCode } });
    if (existing) throw new HttpException(`Partner code '${dto.partnerCode}' already exists`, 409);

    const apiKey = `pk_${dto.partnerCode}_${randomBytes(12).toString('hex')}`;

    return this.db.partnerRegistry.create({
      data: {
        ...dto,
        apiKey,
        onboardedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
        ...(dto.trialEndsAt && { trialEndsAt: new Date(dto.trialEndsAt) }),
      },
    });
  }

  async update(partnerCode: string, dto: UpdatePartnerDto, updatedBy?: string) {
    return this.db.partnerRegistry.update({
      where: { partnerCode },
      data: { ...dto, updatedBy },
    });
  }

  async toggleActive(partnerCode: string) {
    const partner = await this.db.partnerRegistry.findUnique({ where: { partnerCode } });
    if (!partner) throw new HttpException('Partner not found', 404);
    return this.db.partnerRegistry.update({
      where: { partnerCode },
      data: { isActive: !partner.isActive },
    });
  }

  async enableVertical(partnerCode: string, verticalCode: string, config?: any) {
    return this.db.partnerVerticalAccess.upsert({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
      create: { partnerCode, verticalCode, isEnabled: true, config: config ?? {} },
      update: { isEnabled: true, config: config ?? {} },
    });
  }

  async disableVertical(partnerCode: string, verticalCode: string) {
    return this.db.partnerVerticalAccess.update({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
      data: { isEnabled: false },
    });
  }

  async getVerticals(partnerCode: string) {
    return this.db.partnerVerticalAccess.findMany({
      where: { partnerCode },
    });
  }

  async regenerateApiKey(partnerCode: string) {
    const newKey = `pk_${partnerCode}_${randomBytes(12).toString('hex')}`;
    return this.db.partnerRegistry.update({
      where: { partnerCode },
      data: { apiKey: newKey },
      select: { partnerCode: true, apiKey: true },
    });
  }
}
