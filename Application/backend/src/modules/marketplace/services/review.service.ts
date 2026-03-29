import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update a review (unique per module+tenant).
   */
  async create(
    tenantId: string,
    moduleId: string,
    data: {
      rating: number;
      title?: string;
      comment?: string;
    },
  ) {
    // Verify module exists
    const mod = await this.prisma.platform.marketplaceModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
    }

    // Verify tenant has installed this module
    const installation = await this.prisma.platform.tenantMarketplaceModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId } },
    });
    if (!installation) {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        review: 'You must install this module before leaving a review',
      });
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        rating: 'Rating must be between 1 and 5',
      });
    }

    // Upsert review (unique constraint on moduleId + tenantId)
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

    // Recalculate rating
    await this.recalculateRating(moduleId);

    return review;
  }

  /**
   * List reviews for a module with pagination.
   */
  async listForModule(moduleId: string, page = 1, limit = 10) {
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

  /**
   * Recalculate avgRating and reviewCount on MarketplaceModule.
   */
  async recalculateRating(moduleId: string) {
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
}
