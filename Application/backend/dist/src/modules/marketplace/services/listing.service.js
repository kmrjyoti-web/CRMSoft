"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ListingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const pricing_access_service_1 = require("../../softwarevendor/verification/services/pricing-access.service");
let ListingService = ListingService_1 = class ListingService {
    constructor(prisma, pricingService) {
        this.prisma = prisma;
        this.pricingService = pricingService;
        this.logger = new common_1.Logger(ListingService_1.name);
    }
    async create(tenantId, vendorId, dto) {
        const { b2bTiers, ...listingData } = dto;
        const slug = this.generateSlug(dto.title);
        let status = 'LST_DRAFT';
        if (dto.publishAt && new Date(dto.publishAt) > new Date()) {
            status = 'LST_SCHEDULED';
        }
        else if (!dto.publishAt) {
            status = 'LST_ACTIVE';
        }
        const listing = await this.prisma.platform.marketplaceListing.create({
            data: {
                tenantId,
                vendorId,
                ...listingData,
                tags: listingData.tags || [],
                mediaUrls: listingData.mediaUrls || [],
                attributes: listingData.attributes || {},
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
        });
        await this.prisma.platform.listingAnalytics.create({
            data: { listingId: listing.id },
        });
        this.logger.log(`Listing created: ${listing.id}`);
        return listing;
    }
    async findById(listingId, userId) {
        const listing = await this.prisma.platform.marketplaceListing.findUnique({
            where: { id: listingId },
            include: {
                priceTiers: { orderBy: { minQty: 'asc' } },
                analytics: true,
            },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        const pricing = await this.pricingService.getPricingForUser(userId || null, Number(listing.b2cPrice), listing.priceTiers.map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            pricePerUnit: Number(t.pricePerUnit),
        })), listing.currency);
        await this.trackView(listingId);
        return {
            ...listing,
            pricing,
            priceTiers: pricing.showB2BPricing ? listing.priceTiers : undefined,
        };
    }
    async findMany(tenantId, filters, pagination, userId) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const where = { tenantId, status: 'LST_ACTIVE' };
        if (filters.listingType)
            where.listingType = filters.listingType;
        if (filters.category)
            where.category = filters.category;
        if (filters.vendorId)
            where.vendorId = filters.vendorId;
        if (filters.status)
            where.status = filters.status;
        if (filters.minPrice)
            where.b2cPrice = { gte: filters.minPrice };
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
        const data = await Promise.all(listings.map(async (listing) => {
            const pricing = await this.pricingService.getPricingForUser(userId || null, Number(listing.b2cPrice), listing.priceTiers.map((t) => ({
                minQty: t.minQty,
                maxQty: t.maxQty,
                pricePerUnit: Number(t.pricePerUnit),
            })), listing.currency);
            return { ...listing, pricing, priceTiers: undefined };
        }));
        return {
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async update(listingId, tenantId, vendorId, dto) {
        const listing = await this.prisma.platform.marketplaceListing.findFirst({
            where: { id: listingId, tenantId, vendorId },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        const { b2bTiers, ...updateData } = dto;
        const updated = await this.prisma.platform.marketplaceListing.update({
            where: { id: listingId },
            data: updateData,
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
    async getVendorListings(tenantId, vendorId) {
        return this.prisma.platform.marketplaceListing.findMany({
            where: { tenantId, vendorId },
            orderBy: { createdAt: 'desc' },
            include: { analytics: true },
        });
    }
    async trackView(listingId) {
        await this.prisma.platform.marketplaceListing.update({
            where: { id: listingId },
            data: { viewCount: { increment: 1 } },
        });
        const today = new Date().toISOString().split('T')[0];
        const analytics = await this.prisma.platform.listingAnalytics.findUnique({
            where: { listingId },
        });
        if (!analytics)
            return;
        const dailyStats = analytics.dailyStats || [];
        const todayIdx = dailyStats.findIndex((d) => d.date === today);
        if (todayIdx >= 0) {
            dailyStats[todayIdx].views++;
        }
        else {
            dailyStats.push({ date: today, views: 1, enquiries: 0, orders: 0 });
        }
        await this.prisma.platform.listingAnalytics.update({
            where: { listingId },
            data: {
                totalViews: { increment: 1 },
                dailyStats: dailyStats.slice(-90),
            },
        });
    }
    async trackEnquiry(listingId) {
        await this.prisma.platform.marketplaceListing.update({
            where: { id: listingId },
            data: { enquiryCount: { increment: 1 } },
        });
        await this.prisma.platform.listingAnalytics.updateMany({
            where: { listingId },
            data: { totalEnquiries: { increment: 1 } },
        });
    }
    async trackOrder(listingId) {
        await this.prisma.platform.marketplaceListing.update({
            where: { id: listingId },
            data: { orderCount: { increment: 1 } },
        });
        await this.prisma.platform.listingAnalytics.updateMany({
            where: { listingId },
            data: { totalOrders: { increment: 1 } },
        });
    }
    generateSlug(title) {
        const base = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const random = Math.random().toString(36).substring(2, 8);
        return `${base}-${random}`;
    }
};
exports.ListingService = ListingService;
exports.ListingService = ListingService = ListingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_access_service_1.PricingAccessService])
], ListingService);
//# sourceMappingURL=listing.service.js.map