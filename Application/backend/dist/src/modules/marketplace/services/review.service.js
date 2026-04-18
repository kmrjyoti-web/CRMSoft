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
var ReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const app_error_1 = require("../../../common/errors/app-error");
let ReviewService = ReviewService_1 = class ReviewService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReviewService_1.name);
    }
    async create(tenantId, moduleId, data) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { id: moduleId },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        const installation = await this.prisma.platform.tenantMarketplaceModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId } },
        });
        if (!installation) {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                review: 'You must install this module before leaving a review',
            });
        }
        if (data.rating < 1 || data.rating > 5) {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                rating: 'Rating must be between 1 and 5',
            });
        }
        const review = await this.prisma.platform.marketplaceReview.upsert({
            where: { moduleId_tenantId: { moduleId, tenantId } },
            update: {
                rating: data.rating,
                title: data.title ?? null,
                comment: data.comment ?? null,
            },
            create: {
                moduleId,
                tenantId,
                rating: data.rating,
                title: data.title ?? null,
                comment: data.comment ?? null,
            },
        });
        await this.recalculateRating(moduleId);
        return review;
    }
    async listForModule(moduleId, page = 1, limit = 10) {
        const p = Math.max(1, page);
        const l = Math.min(50, Math.max(1, limit));
        const [data, total] = await Promise.all([
            this.prisma.platform.marketplaceReview.findMany({
                where: { moduleId },
                skip: (p - 1) * l,
                take: l,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.platform.marketplaceReview.count({ where: { moduleId } }),
        ]);
        return { data, total, page: p, limit: l };
    }
    async recalculateRating(moduleId) {
        const result = await this.prisma.platform.marketplaceReview.aggregate({
            where: { moduleId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const avgRating = result._avg.rating ?? 0;
        const reviewCount = result._count.rating ?? 0;
        await this.prisma.platform.marketplaceModule.update({
            where: { id: moduleId },
            data: {
                avgRating: Math.round(avgRating * 100) / 100,
                reviewCount,
            },
        });
        return { avgRating, reviewCount };
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = ReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map