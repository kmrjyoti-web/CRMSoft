import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TalentIdService } from './talent-id.service';

const COMPANY_CATEGORY_CODES = ['COMPANY_B2B', 'COMPANY_B2C', 'INDIVIDUAL_SP'];

@Injectable()
export class MappingService {
  constructor(
    private prisma: PrismaService,
    private talentId: TalentIdService,
  ) {}

  async createForRegistration(params: {
    userId: string;
    categoryCode: string;
    subcategoryCode: string;
    brandCode: string;
    verticalCode: string;
    registrationFields?: Record<string, any>;
    requiresApproval: boolean;
    selectedBusinessModes?: string[];
  }): Promise<{ company: any; mapping: any } | null> {
    if (!COMPANY_CATEGORY_CODES.includes(params.categoryCode)) return null;

    const companyName =
      params.registrationFields?.company_name ??
      params.registrationFields?.agency_name ??
      params.registrationFields?.full_name ??
      'Unknown';

    const companyTalentId = await this.talentId.nextCompanyId();

    const company = await (this.prisma.identity as any).company.create({
      data: {
        talentId: companyTalentId,
        name: companyName,
        categoryCode: params.categoryCode,
        subcategoryCode: params.subcategoryCode,
        brandCode: params.brandCode,
        verticalCode: params.verticalCode,
        registrationFields: (params.registrationFields ?? {}) as any,
        ownerId: params.userId,
        status: params.requiresApproval ? 'PENDING_VERIFICATION' : 'ACTIVE',
      },
    });

    const modes = params.selectedBusinessModes ?? [];
    const selectedBusinessModes = modes.length > 0
      ? { modes, primaryMode: modes[0], setAt: new Date().toISOString(), setByUser: true }
      : [];

    const mapping = await (this.prisma.identity as any).userCompanyMapping.create({
      data: {
        userId: params.userId,
        companyId: company.id,
        role: 'OWNER',
        joinMode: 'SELF_REGISTERED',
        status: params.requiresApproval ? 'PENDING' : 'ACTIVE',
        isDefault: true,
        selectedBusinessModes,
      },
    });

    await (this.prisma.identity as any).userCompanyMappingLog.create({
      data: {
        mappingId: mapping.id,
        changedBy: params.userId,
        action: 'CREATED',
        toStatus: mapping.status,
        toRole: 'OWNER',
        note: `Self-registered via ${params.brandCode}/${params.verticalCode}`,
      },
    });

    return { company, mapping };
  }

  async getUserCompanies(userId: string) {
    return (this.prisma.identity as any).userCompanyMapping.findMany({
      where: { userId, isDeleted: false, status: 'ACTIVE' },
      include: { company: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getDefaultCompany(userId: string) {
    return (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, isDefault: true, status: 'ACTIVE', isDeleted: false },
      include: { company: true },
    });
  }

  async setDefault(userId: string, companyId: string) {
    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, companyId, isDeleted: false },
    });
    if (!mapping) throw new NotFoundException('Company mapping not found');

    await (this.prisma.identity as any).userCompanyMapping.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
    await (this.prisma.identity as any).userCompanyMapping.update({
      where: { id: mapping.id },
      data: { isDefault: true },
    });
    await (this.prisma.identity as any).userCompanyMappingLog.create({
      data: {
        mappingId: mapping.id,
        changedBy: userId,
        action: 'SET_DEFAULT',
        note: 'Set as default company',
      },
    });
    return { message: 'Default company updated' };
  }

  async verifyMembership(userId: string, companyId: string): Promise<boolean> {
    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, companyId, status: 'ACTIVE', isDeleted: false },
    });
    return !!mapping;
  }
}
