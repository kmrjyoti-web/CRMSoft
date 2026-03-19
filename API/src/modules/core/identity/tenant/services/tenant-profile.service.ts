import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class TenantProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get tenant profile by tenantId, including basic tenant info.
   */
  async getByTenantId(tenantId: string) {
    const profile = await this.prisma.tenantProfile.findUnique({
      where: { tenantId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
            logo: true,
            status: true,
            onboardingStep: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Tenant profile not found for tenant ${tenantId}`);
    }

    return profile;
  }

  /**
   * Create or update a tenant profile by tenantId.
   */
  async upsert(tenantId: string, data: any) {
    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    return this.prisma.tenantProfile.upsert({
      where: { tenantId },
      update: {
        companyLegalName: data.companyLegalName,
        industry: data.industry,
        website: data.website,
        supportEmail: data.supportEmail,
        dbStrategy: data.dbStrategy,
        dbConnectionString: data.dbConnectionString,
        primaryContactName: data.primaryContactName,
        primaryContactEmail: data.primaryContactEmail,
        primaryContactPhone: data.primaryContactPhone,
        billingAddress: data.billingAddress,
        gstin: data.gstin,
        pan: data.pan,
        accountManagerId: data.accountManagerId,
        notes: data.notes,
        tags: data.tags,
        maxDiskQuotaMb: data.maxDiskQuotaMb,
      },
      create: {
        tenantId,
        companyLegalName: data.companyLegalName,
        industry: data.industry,
        website: data.website,
        supportEmail: data.supportEmail,
        dbStrategy: data.dbStrategy ?? 'SHARED',
        dbConnectionString: data.dbConnectionString,
        primaryContactName: data.primaryContactName,
        primaryContactEmail: data.primaryContactEmail,
        primaryContactPhone: data.primaryContactPhone,
        billingAddress: data.billingAddress,
        gstin: data.gstin,
        pan: data.pan,
        accountManagerId: data.accountManagerId,
        notes: data.notes,
        tags: data.tags ?? [],
        maxDiskQuotaMb: data.maxDiskQuotaMb ?? 500,
      },
    });
  }

  /**
   * Update billing-specific fields for a tenant profile.
   */
  async updateBilling(
    tenantId: string,
    data: { gstin?: string; pan?: string; billingAddress?: any },
  ) {
    const profile = await this.prisma.tenantProfile.findUnique({
      where: { tenantId },
    });

    if (!profile) {
      throw new NotFoundException(`Tenant profile not found for tenant ${tenantId}`);
    }

    return this.prisma.tenantProfile.update({
      where: { tenantId },
      data: {
        gstin: data.gstin,
        pan: data.pan,
        billingAddress: data.billingAddress,
      },
    });
  }

  /**
   * Paginated list of all tenant profiles with tenant name join.
   */
  async listAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    dbStrategy?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { companyLegalName: { contains: query.search, mode: 'insensitive' } },
        { primaryContactName: { contains: query.search, mode: 'insensitive' } },
        { primaryContactEmail: { contains: query.search, mode: 'insensitive' } },
        { tenant: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.dbStrategy) {
      where.dbStrategy = query.dbStrategy;
    }

    const [data, total] = await Promise.all([
      this.prisma.tenantProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.tenantProfile.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
