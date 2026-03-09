import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

/**
 * Handles auto-publish and auto-expire for marketplace listings and posts.
 * Called by cron job every 5 minutes.
 */
@Injectable()
export class MarketplaceSchedulingService {
  private readonly logger = new Logger(MarketplaceSchedulingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process all scheduled and expired items.
   */
  async processScheduled(): Promise<{ published: number; expired: number }> {
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
      this.logger.log(
        `Marketplace scheduling: ${published} published, ${expired} expired`,
      );
    }

    return { published, expired };
  }

  // ═══════════════════════════════════════════════════════
  // AUTO-PUBLISH
  // ═══════════════════════════════════════════════════════

  private async publishScheduledListings(now: Date): Promise<number> {
    const result = await this.prisma.marketplaceListing.updateMany({
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

  private async publishScheduledPosts(now: Date): Promise<number> {
    const result = await this.prisma.marketplacePost.updateMany({
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

  // ═══════════════════════════════════════════════════════
  // AUTO-EXPIRE
  // ═══════════════════════════════════════════════════════

  private async expireListings(now: Date): Promise<number> {
    // First get items to expire so we can process expiry actions
    const toExpire = await this.prisma.marketplaceListing.findMany({
      where: {
        status: 'LST_ACTIVE',
        expiresAt: { lte: now },
      },
      select: { id: true, expiryAction: true, vendorId: true },
    });

    if (toExpire.length === 0) return 0;

    // Process each expiry action
    for (const listing of toExpire) {
      let newStatus: string;
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

      await this.prisma.marketplaceListing.update({
        where: { id: listing.id },
        data: { status: newStatus as any },
      });
    }

    return toExpire.length;
  }

  private async expirePosts(now: Date): Promise<number> {
    const toExpire = await this.prisma.marketplacePost.findMany({
      where: {
        status: 'PS_ACTIVE',
        expiresAt: { lte: now },
      },
      select: { id: true, expiryAction: true },
    });

    if (toExpire.length === 0) return 0;

    for (const post of toExpire) {
      let newStatus: string;
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

      await this.prisma.marketplacePost.update({
        where: { id: post.id },
        data: { status: newStatus as any },
      });
    }

    return toExpire.length;
  }
}
