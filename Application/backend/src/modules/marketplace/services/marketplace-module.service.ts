import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class MarketplaceModuleService {
  private readonly logger = new Logger(MarketplaceModuleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new module draft for a vendor.
   */
  async create(
    vendorId: string,
    data: {
      moduleCode: string;
      moduleName: string;
      category: string;
      shortDescription: string;
      longDescription: string;
      screenshots?: string[];
      demoVideoUrl?: string;
      documentationUrl?: string;
      version?: string;
      pricingPlans?: Record<string, unknown>[];
      usageLimits?: Record<string, any>;
      targetTypes?: string[];
      launchOfferDays?: number;
    },
  ) {
    // Verify vendor exists and is approved
    const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
    }
    if (vendor.status !== 'APPROVED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        vendor: 'Vendor must be approved before publishing modules',
      });
    }

    // Check moduleCode uniqueness
    const existing = await this.prisma.platform.marketplaceModule.findUnique({
      where: { moduleCode: data.moduleCode },
    });
    if (existing) {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        moduleCode: 'A module with this code already exists',
      });
    }

    const launchOfferEnds = data.launchOfferDays
      ? new Date(Date.now() + data.launchOfferDays * 24 * 60 * 60 * 1000)
      : null;

    return this.prisma.platform.marketplaceModule.create({
      data: {
        vendorId,
        moduleCode: data.moduleCode,
        moduleName: data.moduleName,
        category: data.category,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        screenshots: data.screenshots ?? [],
        demoVideoUrl: data.demoVideoUrl ?? null,
        documentationUrl: data.documentationUrl ?? null,
        version: data.version ?? '1.0.0',
        pricingPlans: data.pricingPlans ?? [] as any,
        usageLimits: data.usageLimits ?? {},
        targetTypes: data.targetTypes ?? ['ALL'],
        launchOfferDays: data.launchOfferDays ?? null,
        launchOfferEnds,
        status: 'DRAFT',
      },
    });
  }

  /**
   * Update an existing module (only DRAFT or REVIEW status).
   */
  async update(
    moduleId: string,
    data: {
      moduleName?: string;
      category?: string;
      shortDescription?: string;
      longDescription?: string;
      screenshots?: string[];
      demoVideoUrl?: string;
      documentationUrl?: string;
      version?: string;
      changelog?: Record<string, unknown>[];
      pricingPlans?: Record<string, unknown>[];
      usageLimits?: Record<string, any>;
      targetTypes?: string[];
      launchOfferDays?: number;
    },
  ) {
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }

    const updateData: any = {};
    if (data.moduleName !== undefined) updateData.moduleName = data.moduleName;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.longDescription !== undefined) updateData.longDescription = data.longDescription;
    if (data.screenshots !== undefined) updateData.screenshots = data.screenshots;
    if (data.demoVideoUrl !== undefined) updateData.demoVideoUrl = data.demoVideoUrl;
    if (data.documentationUrl !== undefined) updateData.documentationUrl = data.documentationUrl;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.changelog !== undefined) updateData.changelog = data.changelog;
    if (data.pricingPlans !== undefined) updateData.pricingPlans = data.pricingPlans;
    if (data.usageLimits !== undefined) updateData.usageLimits = data.usageLimits;
    if (data.targetTypes !== undefined) updateData.targetTypes = data.targetTypes;
    if (data.launchOfferDays !== undefined) {
      updateData.launchOfferDays = data.launchOfferDays;
      updateData.launchOfferEnds = data.launchOfferDays
        ? new Date(Date.now() + data.launchOfferDays * 24 * 60 * 60 * 1000)
        : null;
    }

    return this.prisma.platform.marketplaceModule.update({
      where: { id: moduleId },
      data: updateData,
    });
  }

  /**
   * Submit a DRAFT module for review.
   */
  async submitForReview(moduleId: string) {
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }
    if (mod.status !== 'DRAFT') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: `Module must be in DRAFT status to submit for review. Current: ${mod.status}`,
      });
    }

    return this.prisma.platform.marketplaceModule.update({
      where: { id: moduleId },
      data: { status: 'REVIEW' },
    });
  }

  /**
   * Publish a module (admin action, must be in REVIEW status).
   */
  async publish(moduleId: string) {
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }
    if (mod.status !== 'REVIEW') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: `Module must be in REVIEW status to publish. Current: ${mod.status}`,
      });
    }

    return this.prisma.platform.marketplaceModule.update({
      where: { id: moduleId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Suspend a published module.
   */
  async suspend(moduleId: string) {
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }
    if (mod.status === 'SUSPENDED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: 'Module is already suspended',
      });
    }

    return this.prisma.platform.marketplaceModule.update({
      where: { id: moduleId },
      data: { status: 'SUSPENDED' },
    });
  }

  /**
   * List published modules with filters (category, search, businessType).
   */
  async listPublished(query?: {
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
    businessType?: string;
  }) {
    const page = Math.max(1, +(query?.page || '1'));
    const limit = Math.min(100, Math.max(1, +(query?.limit || '20')));

    const where: any = { status: 'PUBLISHED' };

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.search) {
      where.OR = [
        { moduleName: { contains: query.search, mode: 'insensitive' } },
        { shortDescription: { contains: query.search, mode: 'insensitive' } },
        { moduleCode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.businessType) {
      where.targetTypes = { array_contains: [query.businessType] };
    }

    const [data, total] = await Promise.all([
      this.prisma.platform.marketplaceModule.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { installCount: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              companyName: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.platform.marketplaceModule.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get full module detail by code with vendor info and reviews.
   */
  async getDetail(moduleCode: string) {
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { moduleCode },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
            status: true,
            verifiedAt: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }

    return mod;
  }

  /**
   * Get featured modules (published, highest rated, most installs).
   */
  async getFeatured() {
    const modules = await this.prisma.platform.marketplaceModule.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { avgRating: 'desc' },
        { installCount: 'desc' },
      ],
      take: 10,
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    return modules;
  }
}
