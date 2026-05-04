import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PricingAccessService } from '../../softwarevendor/verification/services/pricing-access.service';
import { ListingStatus, ListingType, VisibilityType } from '@prisma/platform-client';

interface CreateListingDto {
  listingType: ListingType;
  title: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  b2cPrice: number;
  compareAtPrice?: number;
  b2bEnabled?: boolean;
  b2bTiers?: Array<{ minQty: number; maxQty?: number; pricePerUnit: number }>;
  mediaUrls?: any[];
  visibility?: VisibilityType;
  visibilityConfig?: Record<string, unknown>;
  publishAt?: Date;
  expiresAt?: Date;
  attributes?: Record<string, unknown>;
  moq?: number;
  stockAvailable?: number;
  shippingConfig?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

interface ListingFilters {
  listingType?: ListingType;
  category?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  vendorId?: string;
}

@Injectable()
export class ListingService {
  private readonly logger = new Logger(ListingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingAccessService,
  ) {}

  // -------------------------------------------------------
  // CREATE
  // -------------------------------------------------------

  async create(tenantId: string, vendorId: string, dto: CreateListingDto) {
    const { b2bTiers, ...listingData } = dto;

    const slug = this.generateSlug(dto.title);

    let status: ListingStatus = 'LST_DRAFT';
    if (dto.publishAt && new Date(dto.publishAt) > new Date()) {
      status = 'LST_SCHEDULED';
    } else if (!dto.publishAt) {
      status = 'LST_ACTIVE';
    }

    const listing = await this.prisma.platform.marketplaceListing.create({
      data: {
        tenantId,
        vendorId,
        ...listingData,
        tags: listingData.tags || [],
        mediaUrls: listingData.mediaUrls || [] as any,
        attributes: listingData.attributes || {} as any,
        keywords: listingData.keywords || [],
        slug,
        status,
        publishedAt: status === 'LST_ACTIVE' ? new Date() : null,
        priceTiers: b2bTiers?.length
          ? {
              create: b2bTiers.map((tier) => ({
                minQty: tier.minQty,
                maxQty: tier.maxQty ?? null,
                pricePerUnit: tier.pricePerUnit,
              })),
            }
          : undefined,
      },
      include: { priceTiers: true },
    } as any);

    // Create analytics record
    await this.prisma.platform.listingAnalytics.create({
      data: { listingId: listing.id },
    });

    this.logger.log(`Listing created: ${listing.id}`);
    return listing;
  }

  // -------------------------------------------------------
  // GET BY ID WITH PRICING
  // -------------------------------------------------------

  async findById(listingId: string, userId?: string) {
    const listing = await this.prisma.platform.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        priceTiers: { orderBy: { minQty: 'asc' } },
        analytics: true,
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    const pricing = await this.pricingService.getPricingForUser(
      userId || null,
      Number(listing.b2cPrice),
      listing.priceTiers.map((t) => ({
        minQty: t.minQty,
        maxQty: t.maxQty,
        pricePerUnit: Number(t.pricePerUnit),
      })),
      listing.currency,
    );

    // Track view
    await this.trackView(listingId);

    return {
      ...listing,
      pricing,
      priceTiers: pricing.showB2BPricing ? listing.priceTiers : undefined,
    };
  }

  // -------------------------------------------------------
  // LIST WITH FILTERS
  // -------------------------------------------------------

  async findMany(
    tenantId: string,
    filters: ListingFilters,
    pagination: { page: number; limit: number },
    userId?: string,
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, status: 'LST_ACTIVE' };

    if (filters.listingType) where.listingType = filters.listingType;
    if (filters.category) where.category = filters.category;
    if (filters.vendorId) where.vendorId = filters.vendorId;
    if (filters.status) where.status = filters.status;
    if (filters.minPrice) where.b2cPrice = { gte: filters.minPrice };
    if (filters.maxPrice) {
      where.b2cPrice = { ...where.b2cPrice, lte: filters.maxPrice };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      this.prisma.platform.marketplaceListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: { priceTiers: { orderBy: { minQty: 'asc' } } },
      }),
      this.prisma.platform.marketplaceListing.count({ where }),
    ]);

    const data = await Promise.all(
      listings.map(async (listing) => {
        const pricing = await this.pricingService.getPricingForUser(
          userId || null,
          Number(listing.b2cPrice),
          listing.priceTiers.map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            pricePerUnit: Number(t.pricePerUnit),
          })),
          listing.currency,
        );
        return { ...listing, pricing, priceTiers: undefined };
      }),
    );

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // -------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------

  async update(listingId: string, tenantId: string, vendorId: string, dto: Partial<CreateListingDto>) {
    const listing = await this.prisma.platform.marketplaceListing.findFirst({
      where: { id: listingId, tenantId, vendorId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const { b2bTiers, ...updateData } = dto;

    const updated = await this.prisma.platform.marketplaceListing.update({
      where: { id: listingId },
      data: updateData as any,
    });

    if (b2bTiers) {
      await this.prisma.platform.listingPriceTier.deleteMany({ where: { listingId } });
      if (b2bTiers.length > 0) {
        await this.prisma.platform.listingPriceTier.createMany({
          data: b2bTiers.map((tier) => ({
            listingId,
            minQty: tier.minQty,
            maxQty: tier.maxQty ?? null,
            pricePerUnit: tier.pricePerUnit,
          })),
        });
      }
    }

    return updated;
  }

  // -------------------------------------------------------
  // VENDOR LISTINGS
  // -------------------------------------------------------

  async getVendorListings(tenantId: string, vendorId: string) {
    return this.prisma.platform.marketplaceListing.findMany({
      where: { tenantId, vendorId },
      orderBy: { createdAt: 'desc' },
      include: { analytics: true },
    });
  }

  // -------------------------------------------------------
  // TRACKING
  // -------------------------------------------------------

  private async trackView(listingId: string) {
    await this.prisma.platform.marketplaceListing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } },
    });

    const today = new Date().toISOString().split('T')[0];
    const analytics = await this.prisma.platform.listingAnalytics.findUnique({
      where: { listingId },
    });
    if (!analytics) return;

    const dailyStats = (analytics.dailyStats as any[]) || [];
    const todayIdx = dailyStats.findIndex((d: Record<string, unknown>) => d.date === today);
    if (todayIdx >= 0) {
      dailyStats[todayIdx].views++;
    } else {
      dailyStats.push({ date: today, views: 1, enquiries: 0, orders: 0 });
    }

    await this.prisma.platform.listingAnalytics.update({
      where: { listingId },
      data: {
        totalViews: { increment: 1 },
        dailyStats: dailyStats.slice(-90) as any,
      },
    });
  }

  async trackEnquiry(listingId: string) {
    await this.prisma.platform.marketplaceListing.update({
      where: { id: listingId },
      data: { enquiryCount: { increment: 1 } },
    });
    await this.prisma.platform.listingAnalytics.updateMany({
      where: { listingId },
      data: { totalEnquiries: { increment: 1 } },
    });
  }

  async trackOrder(listingId: string) {
    await this.prisma.platform.marketplaceListing.update({
      where: { id: listingId },
      data: { orderCount: { increment: 1 } },
    });
    await this.prisma.platform.listingAnalytics.updateMany({
      where: { listingId },
      data: { totalOrders: { increment: 1 } },
    });
  }

  // -------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `${base}-${random}`;
  }
}
