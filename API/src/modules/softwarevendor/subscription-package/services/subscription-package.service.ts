import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { industryFilter } from '../../../../common/utils/industry-filter.util';

@Injectable()
export class SubscriptionPackageService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all packages ordered by planLevel */
  async listAll(activeOnly?: boolean, industryCode?: string) {
    const where: any = { ...industryFilter(industryCode) };
    if (activeOnly) where.isActive = true;

    return this.prisma.subscriptionPackage.findMany({
      where,
      orderBy: { planLevel: 'asc' },
      include: { coupons: { where: { isActive: true }, select: { id: true, code: true } } },
    });
  }

  /** Get a single package by its unique code */
  async getByCode(code: string) {
    const pkg = await this.prisma.subscriptionPackage.findUnique({
      where: { packageCode: code },
      include: { coupons: true },
    });
    if (!pkg) throw new NotFoundException(`Package with code "${code}" not found`);
    return pkg;
  }

  /** Create a new subscription package */
  async create(data: {
    packageCode: string;
    packageName: string;
    tagline?: string;
    applicableTypes?: any;
    includedModules?: any;
    limits?: any;
    priceMonthlyInr: number;
    priceYearlyInr: number;
    yearlyDiscountPct?: number;
    trialDays?: number;
    featureFlags?: any;
    planLevel: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.subscriptionPackage.create({
      data: {
        packageCode: data.packageCode.toUpperCase(),
        packageName: data.packageName,
        tagline: data.tagline,
        applicableTypes: data.applicableTypes ?? ['ALL'],
        includedModules: data.includedModules ?? [],
        limits: data.limits ?? {},
        priceMonthlyInr: data.priceMonthlyInr,
        priceYearlyInr: data.priceYearlyInr,
        yearlyDiscountPct: data.yearlyDiscountPct ?? 20,
        trialDays: data.trialDays ?? 14,
        featureFlags: data.featureFlags ?? {},
        planLevel: data.planLevel,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  /** Update a subscription package */
  async update(
    id: string,
    data: Partial<{
      packageName: string;
      tagline: string;
      applicableTypes: any;
      includedModules: any;
      limits: any;
      priceMonthlyInr: number;
      priceYearlyInr: number;
      yearlyDiscountPct: number;
      trialDays: number;
      featureFlags: any;
      planLevel: number;
      isActive: boolean;
      isFeatured: boolean;
      sortOrder: number;
    }>,
  ) {
    const existing = await this.prisma.subscriptionPackage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Package "${id}" not found`);

    return this.prisma.subscriptionPackage.update({
      where: { id },
      data,
    });
  }

  /** Soft-deactivate a package (set isActive = false) */
  async deactivate(id: string) {
    const existing = await this.prisma.subscriptionPackage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Package "${id}" not found`);

    return this.prisma.subscriptionPackage.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** List featured active packages */
  async getFeatured(industryCode?: string) {
    return this.prisma.subscriptionPackage.findMany({
      where: { isActive: true, isFeatured: true, ...industryFilter(industryCode) } as any,
      orderBy: { sortOrder: 'asc' },
    });
  }
}
