import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PostStatus, PostType, VisibilityType } from '@prisma/platform-client';

interface CreatePostDto {
  postType: PostType;
  content?: string;
  mediaUrls?: any[];
  linkedListingId?: string;
  visibility?: VisibilityType;
  visibilityConfig?: any;
  publishAt?: Date;
  expiresAt?: Date;
  hashtags?: string[];
  pollConfig?: any;
}

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════
  // CREATE POST
  // ═══════════════════════════════════════════════════════

  async create(tenantId: string, authorId: string, dto: CreatePostDto) {
    const hashtags = dto.hashtags || this.extractHashtags(dto.content || '');
    const mentions = this.extractMentions(dto.content || '');

    let status: PostStatus = 'PS_DRAFT';
    if (dto.publishAt && new Date(dto.publishAt) > new Date()) {
      status = 'PS_SCHEDULED';
    } else if (!dto.publishAt) {
      status = 'PS_ACTIVE';
    }

    const post = await this.prisma.platform.marketplacePost.create({
      data: {
        tenantId,
        authorId,
        postType: dto.postType,
        content: dto.content,
        mediaUrls: dto.mediaUrls || [],
        linkedListingId: dto.linkedListingId,
        visibility: dto.visibility || 'VIS_PUBLIC',
        visibilityConfig: dto.visibilityConfig,
        status,
        publishAt: dto.publishAt,
        expiresAt: dto.expiresAt,
        publishedAt: status === 'PS_ACTIVE' ? new Date() : null,
        hashtags,
        mentions,
        pollConfig: dto.pollConfig,
      },
    });

    await this.prisma.platform.postAnalytics.create({
      data: { postId: post.id },
    });

    this.logger.log(`Post created: ${post.id}`);
    return post;
  }

  // ═══════════════════════════════════════════════════════
  // GET FEED
  // ═══════════════════════════════════════════════════════

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

    const data = posts.map((post) => ({
      ...post,
      isLiked: userEngagements.get(post.id)?.has('EA_LIKE') || false,
      isSaved: userEngagements.get(post.id)?.has('EA_SAVE') || false,
    }));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════
  // GET POST BY ID
  // ═══════════════════════════════════════════════════════

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

    return post;
  }

  // ═══════════════════════════════════════════════════════
  // LIKE / UNLIKE
  // ═══════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════
  // SAVE / UNSAVE
  // ═══════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════
  // COMMENT
  // ═══════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════
  // SHARE
  // ═══════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════

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
