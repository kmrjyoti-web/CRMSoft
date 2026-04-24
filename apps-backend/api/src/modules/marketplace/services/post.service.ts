import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PostStatus, PostType, VisibilityType } from '@prisma/platform-client';

interface CreatePostDto {
  postType: string;
  content?: string;
  mediaUrls?: Record<string, unknown>[];
  linkedListingId?: string;
  visibility?: string;
  visibilityConfig?: Record<string, unknown>;
  publishAt?: Date;
  expiresAt?: Date;
  hashtags?: string[];
  pollConfig?: Record<string, unknown>;
  // Extended fields from frontend — stored in metadata
  pollOptions?: { text: string }[];
  productName?: string;
  productPrice?: number;
  badgeText?: string;
  rating?: number;
  reqCategory?: string;
  reqQuantity?: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: string;
}

/**
 * Maps frontend postType strings to DB Prisma enum values.
 * New types (CUSTOMER_FEEDBACK, PRODUCT_LAUNCH, REQUIREMENT) map to the
 * closest existing DB enum and store the extended type in pollConfig metadata.
 */
const POST_TYPE_DB_MAP: Record<string, PostType> = {
  TEXT:              'PT_TEXT',
  IMAGE:             'PT_IMAGE',
  VIDEO:             'PT_VIDEO',
  PRODUCT_SHARE:     'PT_PRODUCT_SHARE',
  ANNOUNCEMENT:      'PT_ANNOUNCEMENT',
  POLL:              'PT_POLL',
  CUSTOMER_FEEDBACK: 'PT_TEXT',       // stored in metadata until schema migration
  PRODUCT_LAUNCH:    'PT_PRODUCT_SHARE',
  REQUIREMENT:       'PT_TEXT',
};

/**
 * Maps frontend visibility strings to DB Prisma enum values.
 */
const VISIBILITY_DB_MAP: Record<string, VisibilityType> = {
  PUBLIC:            'VIS_PUBLIC',
  GEO_TARGETED:      'VIS_GEO_TARGETED',
  MY_CONTACTS:       'VIS_MY_CONTACTS',
  VERIFIED_ONLY:     'VIS_VERIFIED_ONLY',
  SELECTED_CONTACTS: 'VIS_SELECTED_CONTACTS',
  CATEGORY_BASED:    'VIS_CATEGORY_BASED',
  GRADE_BASED:       'VIS_GRADE_BASED',
  // Already-mapped values (idempotent)
  VIS_PUBLIC:            'VIS_PUBLIC',
  VIS_GEO_TARGETED:      'VIS_GEO_TARGETED',
  VIS_MY_CONTACTS:       'VIS_MY_CONTACTS',
  VIS_VERIFIED_ONLY:     'VIS_VERIFIED_ONLY',
  VIS_SELECTED_CONTACTS: 'VIS_SELECTED_CONTACTS',
  VIS_CATEGORY_BASED:    'VIS_CATEGORY_BASED',
  VIS_GRADE_BASED:       'VIS_GRADE_BASED',
};

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------
  // CREATE POST
  // -------------------------------------------------------

  async create(tenantId: string, authorId: string, dto: CreatePostDto) {
    const hashtags = dto.hashtags || this.extractHashtags(dto.content || '');
    const mentions = this.extractMentions(dto.content || '');

    let status: PostStatus = 'PS_DRAFT';
    if (dto.publishAt && new Date(dto.publishAt) > new Date()) {
      status = 'PS_SCHEDULED';
    } else if (!dto.publishAt) {
      status = 'PS_ACTIVE';
    }

    // Map frontend postType ? DB enum (with PT_ prefix)
    const dbPostType: PostType = POST_TYPE_DB_MAP[dto.postType] ?? 'PT_TEXT';

    // Map frontend visibility ? DB enum (with VIS_ prefix)
    const dbVisibility: VisibilityType =
      VISIBILITY_DB_MAP[dto.visibility || ''] ?? 'VIS_PUBLIC';

    // Store extended metadata in pollConfig so we can reconstruct on read
    const pollConfig: Record<string, any> = dto.pollConfig || {};
    pollConfig._extPostType = dto.postType; // original frontend type e.g. "REQUIREMENT"
    if (dto.pollOptions?.length) pollConfig.options = dto.pollOptions;
    if (dto.productName !== undefined) pollConfig.productName = dto.productName;
    if (dto.productPrice !== undefined) pollConfig.productPrice = dto.productPrice;
    if (dto.badgeText !== undefined) pollConfig.badgeText = dto.badgeText;
    if (dto.rating !== undefined) pollConfig.rating = dto.rating;
    if (dto.reqCategory !== undefined) pollConfig.reqCategory = dto.reqCategory;
    if (dto.reqQuantity !== undefined) pollConfig.reqQuantity = dto.reqQuantity;
    if (dto.budgetMin !== undefined) pollConfig.budgetMin = dto.budgetMin;
    if (dto.budgetMax !== undefined) pollConfig.budgetMax = dto.budgetMax;
    if (dto.deadline !== undefined) pollConfig.deadline = dto.deadline;

    const post = await this.prisma.platform.marketplacePost.create({
      data: {
        tenantId,
        authorId,
        postType: dbPostType,
        content: dto.content,
        mediaUrls: dto.mediaUrls || [] as any,
        linkedListingId: dto.linkedListingId,
        visibility: dbVisibility,
        visibilityConfig: dto.visibilityConfig as any,
        status,
        publishAt: dto.publishAt,
        expiresAt: dto.expiresAt,
        publishedAt: status === 'PS_ACTIVE' ? new Date() : null,
        hashtags,
        mentions,
        pollConfig,
      },
    });

    await this.prisma.platform.postAnalytics.create({
      data: { postId: post.id },
    });

    this.logger.log(`Post created: ${post.id}`);
    return post;
  }

  // -------------------------------------------------------
  // GET FEED
  // -------------------------------------------------------

  async getFeed(
    tenantId: string,
    pagination: { page: number; limit: number },
    userId?: string,
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.platform.marketplacePost.findMany({
        where: { tenantId, status: 'PS_ACTIVE' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            where: { isDeleted: false },
          },
        },
      }),
      this.prisma.platform.marketplacePost.count({
        where: { tenantId, status: 'PS_ACTIVE' },
      }),
    ]);

    // Check user engagement state
    let userEngagements = new Map<string, Set<string>>();
    if (userId) {
      const engagements = await this.prisma.platform.postEngagement.findMany({
        where: {
          postId: { in: posts.map((p) => p.id) },
          userId,
          action: { in: ['EA_LIKE', 'EA_SAVE'] },
        },
      });
      engagements.forEach((e) => {
        if (!userEngagements.has(e.postId)) {
          userEngagements.set(e.postId, new Set());
        }
        userEngagements.get(e.postId)!.add(e.action);
      });
    }

    const data = posts.map((post) => this.mapPostToResponse(post, userEngagements));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // -------------------------------------------------------
  // GET POST BY ID
  // -------------------------------------------------------

  async findById(postId: string) {
    const post = await this.prisma.platform.marketplacePost.findUnique({
      where: { id: postId },
      include: {
        comments: {
          where: { isDeleted: false, parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            replies: {
              where: { isDeleted: false },
              orderBy: { createdAt: 'asc' },
              take: 5,
            },
          },
        },
        analytics: true,
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    // Track view
    await this.prisma.platform.marketplacePost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    return this.mapPostToResponse(post);
  }

  // -------------------------------------------------------
  // LIKE / UNLIKE
  // -------------------------------------------------------

  async toggleLike(postId: string, userId: string, tenantId: string) {
    const post = await this.findPostOrFail(postId);

    const existing = await this.prisma.platform.postEngagement.findUnique({
      where: { postId_userId_action: { postId, userId, action: 'EA_LIKE' } },
    });

    if (existing) {
      await this.prisma.platform.postEngagement.delete({ where: { id: existing.id } });
      await this.prisma.platform.marketplacePost.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false, likeCount: post.likeCount - 1 };
    }

    await this.prisma.platform.postEngagement.create({
      data: { tenantId, postId, userId, action: 'EA_LIKE' },
    });
    await this.prisma.platform.marketplacePost.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true, likeCount: post.likeCount + 1 };
  }

  // -------------------------------------------------------
  // SAVE / UNSAVE
  // -------------------------------------------------------

  async toggleSave(postId: string, userId: string, tenantId: string) {
    await this.findPostOrFail(postId);

    const existing = await this.prisma.platform.postEngagement.findUnique({
      where: { postId_userId_action: { postId, userId, action: 'EA_SAVE' } },
    });

    if (existing) {
      await this.prisma.platform.postEngagement.delete({ where: { id: existing.id } });
      await this.prisma.platform.marketplacePost.update({
        where: { id: postId },
        data: { saveCount: { decrement: 1 } },
      });
      return { saved: false };
    }

    await this.prisma.platform.postEngagement.create({
      data: { tenantId, postId, userId, action: 'EA_SAVE' },
    });
    await this.prisma.platform.marketplacePost.update({
      where: { id: postId },
      data: { saveCount: { increment: 1 } },
    });
    return { saved: true };
  }

  // -------------------------------------------------------
  // COMMENT
  // -------------------------------------------------------

  async addComment(
    postId: string,
    userId: string,
    tenantId: string,
    content: string,
    parentId?: string,
  ) {
    await this.findPostOrFail(postId);

    const comment = await this.prisma.platform.postComment.create({
      data: { tenantId, postId, userId, content, parentId },
    });

    await this.prisma.platform.marketplacePost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    await this.prisma.platform.postEngagement.create({
      data: {
        tenantId,
        postId,
        userId,
        action: parentId ? 'EA_REPLY' : 'EA_COMMENT',
      },
    });

    return comment;
  }

  // -------------------------------------------------------
  // SHARE
  // -------------------------------------------------------

  async trackShare(postId: string, userId: string, tenantId: string, sharedTo: string) {
    await this.findPostOrFail(postId);

    await this.prisma.platform.postEngagement.create({
      data: { tenantId, postId, userId, action: 'EA_SHARE', sharedTo },
    });

    await this.prisma.platform.marketplacePost.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } },
    });

    return { success: true };
  }

  // -------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------

  /**
   * Reconstructs the frontend-facing postType and metadata from the stored
   * pollConfig._extPostType field, so the feed response matches what the UI expects.
   */
  private mapPostToResponse(
    post: any,
    userEngagements?: Map<string, Set<string>>,
  ): any {
    const meta = (post.pollConfig as Record<string, any>) || {};
    const extPostType = meta._extPostType || this.dbTypeToFrontend(post.postType);

    return {
      ...post,
      postType: extPostType,
      // Flatten metadata fields to top-level for frontend convenience
      pollOptions: meta.options || undefined,
      productName: meta.productName,
      productPrice: meta.productPrice,
      badgeText: meta.badgeText,
      rating: meta.rating ?? post.rating,
      reqCategory: meta.reqCategory,
      reqQuantity: meta.reqQuantity,
      budgetMin: meta.budgetMin,
      budgetMax: meta.budgetMax,
      deadline: meta.deadline,
      isLiked: userEngagements?.get(post.id)?.has('EA_LIKE') || false,
      isSaved: userEngagements?.get(post.id)?.has('EA_SAVE') || false,
    };
  }

  private dbTypeToFrontend(dbType: string): string {
    const reverse: Record<string, string> = {
      PT_TEXT:          'TEXT',
      PT_IMAGE:         'IMAGE',
      PT_VIDEO:         'VIDEO',
      PT_PRODUCT_SHARE: 'PRODUCT_SHARE',
      PT_ANNOUNCEMENT:  'ANNOUNCEMENT',
      PT_POLL:          'POLL',
      PT_JOB_POSTING:   'TEXT',
      PT_NEWS:          'TEXT',
    };
    return reverse[dbType] ?? 'TEXT';
  }

  private async findPostOrFail(postId: string) {
    const post = await this.prisma.platform.marketplacePost.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private extractHashtags(content: string): string[] {
    const matches = content.match(/#(\w+)/g);
    return matches ? matches.map((m) => m.slice(1).toLowerCase()) : [];
  }

  private extractMentions(content: string): string[] {
    const matches = content.match(/@(\w+)/g);
    return matches ? matches.map((m) => m.slice(1)) : [];
  }
}
