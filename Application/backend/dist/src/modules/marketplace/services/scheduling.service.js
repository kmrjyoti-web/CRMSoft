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
var MarketplaceSchedulingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceSchedulingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let MarketplaceSchedulingService = MarketplaceSchedulingService_1 = class MarketplaceSchedulingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MarketplaceSchedulingService_1.name);
    }
    async processScheduled() {
        const now = new Date();
        const [publishedListings, publishedPosts] = await Promise.all([
            this.publishScheduledListings(now),
            this.publishScheduledPosts(now),
        ]);
        const [expiredListings, expiredPosts] = await Promise.all([
            this.expireListings(now),
            this.expirePosts(now),
        ]);
        const published = publishedListings + publishedPosts;
        const expired = expiredListings + expiredPosts;
        if (published > 0 || expired > 0) {
            this.logger.log(`Marketplace scheduling: ${published} published, ${expired} expired`);
        }
        return { published, expired };
    }
    async publishScheduledListings(now) {
        const result = await this.prisma.platform.marketplaceListing.updateMany({
            where: {
                status: 'LST_SCHEDULED',
                publishAt: { lte: now },
            },
            data: {
                status: 'LST_ACTIVE',
                publishedAt: now,
            },
        });
        return result.count;
    }
    async publishScheduledPosts(now) {
        const result = await this.prisma.platform.marketplacePost.updateMany({
            where: {
                status: 'PS_SCHEDULED',
                publishAt: { lte: now },
            },
            data: {
                status: 'PS_ACTIVE',
                publishedAt: now,
            },
        });
        return result.count;
    }
    async expireListings(now) {
        const toExpire = await this.prisma.platform.marketplaceListing.findMany({
            where: {
                status: 'LST_ACTIVE',
                expiresAt: { lte: now },
            },
            select: { id: true, expiryAction: true, vendorId: true },
        });
        if (toExpire.length === 0)
            return 0;
        for (const listing of toExpire) {
            let newStatus;
            switch (listing.expiryAction) {
                case 'EXP_ARCHIVE':
                    newStatus = 'LST_ARCHIVED';
                    break;
                case 'EXP_DELETE':
                    newStatus = 'LST_DEACTIVATED';
                    break;
                default:
                    newStatus = 'LST_EXPIRED';
            }
            await this.prisma.platform.marketplaceListing.update({
                where: { id: listing.id },
                data: { status: newStatus },
            });
        }
        return toExpire.length;
    }
    async expirePosts(now) {
        const toExpire = await this.prisma.platform.marketplacePost.findMany({
            where: {
                status: 'PS_ACTIVE',
                expiresAt: { lte: now },
            },
            select: { id: true, expiryAction: true },
        });
        if (toExpire.length === 0)
            return 0;
        for (const post of toExpire) {
            let newStatus;
            switch (post.expiryAction) {
                case 'EXP_DELETE':
                    newStatus = 'PS_DELETED';
                    break;
                case 'EXP_ARCHIVE':
                    newStatus = 'PS_HIDDEN';
                    break;
                default:
                    newStatus = 'PS_EXPIRED';
            }
            await this.prisma.platform.marketplacePost.update({
                where: { id: post.id },
                data: { status: newStatus },
            });
        }
        return toExpire.length;
    }
};
exports.MarketplaceSchedulingService = MarketplaceSchedulingService;
exports.MarketplaceSchedulingService = MarketplaceSchedulingService = MarketplaceSchedulingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketplaceSchedulingService);
//# sourceMappingURL=scheduling.service.js.map