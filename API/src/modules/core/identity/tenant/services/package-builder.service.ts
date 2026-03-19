import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/identity-client';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class PackageBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------------ */
  /*  1. list                                                            */
  /* ------------------------------------------------------------------ */
  async list(query?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query?.search) {
      where.OR = [
        { packageName: { contains: query.search, mode: 'insensitive' } },
        { packageCode: { contains: query.search, mode: 'insensitive' } },
        { tagline: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.subscriptionPackage.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: { select: { packageModules: true } },
        },
      }),
      this.prisma.subscriptionPackage.count({ where }),
    ]);

    return { data, total };
  }

  /* ------------------------------------------------------------------ */
  /*  2. getById                                                         */
  /* ------------------------------------------------------------------ */
  async getById(id: string) {
    const pkg = await this.prisma.subscriptionPackage.findUnique({
      where: { id },
      include: {
        packageModules: {
          orderBy: { sortOrder: 'asc' },
          include: { module: true },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with id "${id}" not found`);
    }

    return pkg;
  }

  /* ------------------------------------------------------------------ */
  /*  3. create                                                          */
  /* ------------------------------------------------------------------ */
  async create(data: {
    packageCode: string;
    packageName: string;
    tagline?: string;
    description?: string;
    tier?: number;
    priceMonthlyInr: number;
    quarterlyPrice?: number;
    priceYearlyInr: number;
    yearlyDiscountPct?: number;
    oneTimeSetupFee?: number;
    currency?: string;
    trialDays?: number;
    entityLimits?: Record<string, unknown>;
    hasDedicatedDb?: boolean;
    maxDbSizeMb?: number;
    isPopular?: boolean;
    badgeText?: string;
    color?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isPublic?: boolean;
    sortOrder?: number;
  }) {
    const existing = await this.prisma.subscriptionPackage.findUnique({
      where: { packageCode: data.packageCode },
    });

    if (existing) {
      throw new BadRequestException(
        `Package code "${data.packageCode}" already exists`,
      );
    }

    return this.prisma.subscriptionPackage.create({
      data: {
        packageCode: data.packageCode,
        packageName: data.packageName,
        tagline: data.tagline,
        description: data.description,
        tier: data.tier ?? 0,
        priceMonthlyInr: data.priceMonthlyInr,
        quarterlyPrice: data.quarterlyPrice,
        priceYearlyInr: data.priceYearlyInr,
        yearlyDiscountPct: data.yearlyDiscountPct ?? 20,
        oneTimeSetupFee: data.oneTimeSetupFee,
        currency: data.currency ?? 'INR',
        trialDays: data.trialDays ?? 14,
        entityLimits: (data.entityLimits ?? {}) as Prisma.InputJsonValue,
        hasDedicatedDb: data.hasDedicatedDb ?? false,
        maxDbSizeMb: data.maxDbSizeMb,
        isPopular: data.isPopular ?? false,
        badgeText: data.badgeText,
        color: data.color,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isPublic: data.isPublic ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        _count: { select: { packageModules: true } },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  4. update                                                          */
  /* ------------------------------------------------------------------ */
  async update(
    id: string,
    data: {
      packageName?: string;
      tagline?: string;
      description?: string;
      tier?: number;
      priceMonthlyInr?: number;
      quarterlyPrice?: number;
      priceYearlyInr?: number;
      yearlyDiscountPct?: number;
      oneTimeSetupFee?: number;
      currency?: string;
      trialDays?: number;
      entityLimits?: Record<string, unknown>;
      hasDedicatedDb?: boolean;
      maxDbSizeMb?: number;
      isPopular?: boolean;
      badgeText?: string;
      color?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      isPublic?: boolean;
      sortOrder?: number;
    },
  ) {
    await this.ensurePackageExists(id);

    // Cast needed because entityLimits is Record<string, unknown> which doesn't satisfy Prisma's InputJsonValue
     
    return this.prisma.subscriptionPackage.update({
      where: { id },
      data: data as any,
      include: {
        packageModules: {
          orderBy: { sortOrder: 'asc' },
          include: { module: true },
        },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  5. archive                                                         */
  /* ------------------------------------------------------------------ */
  async archive(id: string) {
    await this.ensurePackageExists(id);

    return this.prisma.subscriptionPackage.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  6. addModule                                                       */
  /* ------------------------------------------------------------------ */
  async addModule(
    packageId: string,
    dto: {
      moduleId: string;
      pricingType?: 'FREE' | 'INCLUDED' | 'ADDON' | 'ONE_TIME' | 'PER_USAGE';
      addonPrice?: number;
      oneTimeFee?: number;
      enabledFeatures?: string[];
      disabledFeatures?: string[];
      trialAllowed?: boolean;
      trialDays?: number;
      moduleLimits?: Record<string, unknown>;
      sortOrder?: number;
    },
  ) {
    await this.ensurePackageExists(packageId);

    // Validate module exists
    const moduleDef = await this.prisma.moduleDefinition.findUnique({
      where: { id: dto.moduleId },
    });

    if (!moduleDef) {
      throw new NotFoundException(
        `Module with id "${dto.moduleId}" not found`,
      );
    }

    // Check for duplicate
    const existing = await this.prisma.packageModule.findUnique({
      where: {
        packageId_moduleId: { packageId, moduleId: dto.moduleId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Module "${moduleDef.name}" is already added to this package`,
      );
    }

    return this.prisma.packageModule.create({
      data: {
        packageId,
        moduleId: dto.moduleId,
        pricingType: dto.pricingType ?? 'INCLUDED',
        addonPrice: dto.addonPrice,
        oneTimeFee: dto.oneTimeFee,
        enabledFeatures: dto.enabledFeatures ?? [],
        disabledFeatures: dto.disabledFeatures ?? [],
        trialAllowed: dto.trialAllowed ?? true,
        trialDays: dto.trialDays,
        moduleLimits: dto.moduleLimits ? (dto.moduleLimits as Prisma.InputJsonValue) : undefined,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { module: true },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  7. updateModule                                                    */
  /* ------------------------------------------------------------------ */
  async updateModule(
    packageId: string,
    moduleId: string,
    updates: {
      pricingType?: 'FREE' | 'INCLUDED' | 'ADDON' | 'ONE_TIME' | 'PER_USAGE';
      addonPrice?: number;
      oneTimeFee?: number;
      enabledFeatures?: string[];
      disabledFeatures?: string[];
      trialAllowed?: boolean;
      trialDays?: number;
      moduleLimits?: Record<string, unknown>;
      sortOrder?: number;
    },
  ) {
    const pkgModule = await this.prisma.packageModule.findUnique({
      where: {
        packageId_moduleId: { packageId, moduleId },
      },
    });

    if (!pkgModule) {
      throw new NotFoundException(
        `PackageModule with packageId="${packageId}" and moduleId="${moduleId}" not found`,
      );
    }

     
    return this.prisma.packageModule.update({
      where: {
        packageId_moduleId: { packageId, moduleId },
      },
      data: updates as any,
      include: { module: true },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  8. removeModule                                                    */
  /* ------------------------------------------------------------------ */
  async removeModule(packageId: string, moduleId: string) {
    const pkgModule = await this.prisma.packageModule.findUnique({
      where: {
        packageId_moduleId: { packageId, moduleId },
      },
    });

    if (!pkgModule) {
      throw new NotFoundException(
        `PackageModule with packageId="${packageId}" and moduleId="${moduleId}" not found`,
      );
    }

    return this.prisma.packageModule.delete({
      where: {
        packageId_moduleId: { packageId, moduleId },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  9. updateLimits                                                    */
  /* ------------------------------------------------------------------ */
  async updateLimits(
    packageId: string,
    entityLimits: Record<string, { limit: number; extraPricePerUnit: number }>,
  ) {
    await this.ensurePackageExists(packageId);

    return this.prisma.subscriptionPackage.update({
      where: { id: packageId },
      data: { entityLimits: entityLimits as unknown as Prisma.InputJsonValue },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  10. getSubscribers (placeholder)                                   */
  /* ------------------------------------------------------------------ */
  async getSubscribers(
    packageId: string,
    _query?: { page?: number; limit?: number },
  ) {
    await this.ensurePackageExists(packageId);

    // Placeholder — packages don't directly link to tenants yet
    return { data: [], total: 0 };
  }

  /* ------------------------------------------------------------------ */
  /*  11. getPackageComparison                                           */
  /* ------------------------------------------------------------------ */
  async getPackageComparison(packageIds: string[]) {
    if (!packageIds.length) {
      throw new BadRequestException(
        'At least one package ID is required for comparison',
      );
    }

    const packages = await this.prisma.subscriptionPackage.findMany({
      where: { id: { in: packageIds } },
      orderBy: { tier: 'asc' },
      include: {
        packageModules: {
          orderBy: { sortOrder: 'asc' },
          include: { module: true },
        },
      },
    });

    if (packages.length !== packageIds.length) {
      const foundIds = new Set(packages.map((p) => p.id));
      const missing = packageIds.filter((pid) => !foundIds.has(pid));
      throw new NotFoundException(
        `Packages not found: ${missing.join(', ')}`,
      );
    }

    return packages.map((pkg) => ({
      id: pkg.id,
      packageCode: pkg.packageCode,
      packageName: pkg.packageName,
      tagline: pkg.tagline,
      tier: pkg.tier,
      priceMonthlyInr: pkg.priceMonthlyInr,
      priceYearlyInr: pkg.priceYearlyInr,
      yearlyDiscountPct: pkg.yearlyDiscountPct,
      oneTimeSetupFee: pkg.oneTimeSetupFee,
      currency: pkg.currency,
      trialDays: pkg.trialDays,
      entityLimits: pkg.entityLimits,
      hasDedicatedDb: pkg.hasDedicatedDb,
      maxDbSizeMb: pkg.maxDbSizeMb,
      isPopular: pkg.isPopular,
      badgeText: pkg.badgeText,
      color: pkg.color,
      modules: pkg.packageModules.map((pm) => ({
        moduleId: pm.moduleId,
        moduleName: pm.module.name,
        moduleCode: pm.module.code,
        category: pm.module.category,
        pricingType: pm.pricingType,
        addonPrice: pm.addonPrice,
        oneTimeFee: pm.oneTimeFee,
        enabledFeatures: pm.enabledFeatures,
        disabledFeatures: pm.disabledFeatures,
        trialAllowed: pm.trialAllowed,
        trialDays: pm.trialDays,
        moduleLimits: pm.moduleLimits,
      })),
    }));
  }

  /* ------------------------------------------------------------------ */
  /*  Private helpers                                                    */
  /* ------------------------------------------------------------------ */
  private async ensurePackageExists(id: string) {
    const pkg = await this.prisma.subscriptionPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with id "${id}" not found`);
    }

    return pkg;
  }
}
