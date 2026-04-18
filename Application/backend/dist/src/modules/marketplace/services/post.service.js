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
var PostService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const POST_TYPE_DB_MAP = {
    TEXT: 'PT_TEXT',
    IMAGE: 'PT_IMAGE',
    VIDEO: 'PT_VIDEO',
    PRODUCT_SHARE: 'PT_PRODUCT_SHARE',
    ANNOUNCEMENT: 'PT_ANNOUNCEMENT',
    POLL: 'PT_POLL',
    CUSTOMER_FEEDBACK: 'PT_TEXT',
    PRODUCT_LAUNCH: 'PT_PRODUCT_SHARE',
    REQUIREMENT: 'PT_TEXT',
};
const VISIBILITY_DB_MAP = {
    PUBLIC: 'VIS_PUBLIC',
    GEO_TARGETED: 'VIS_GEO_TARGETED',
    MY_CONTACTS: 'VIS_MY_CONTACTS',
    VERIFIED_ONLY: 'VIS_VERIFIED_ONLY',
    SELECTED_CONTACTS: 'VIS_SELECTED_CONTACTS',
    CATEGORY_BASED: 'VIS_CATEGORY_BASED',
    GRADE_BASED: 'VIS_GRADE_BASED',
    VIS_PUBLIC: 'VIS_PUBLIC',
    VIS_GEO_TARGETED: 'VIS_GEO_TARGETED',
    VIS_MY_CONTACTS: 'VIS_MY_CONTACTS',
    VIS_VERIFIED_ONLY: 'VIS_VERIFIED_ONLY',
    VIS_SELECTED_CONTACTS: 'VIS_SELECTED_CONTACTS',
    VIS_CATEGORY_BASED: 'VIS_CATEGORY_BASED',
    VIS_GRADE_BASED: 'VIS_GRADE_BASED',
};
let PostService = PostService_1 = class PostService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PostService_1.name);
    }
    async create(tenantId, authorId, dto) {
        const hashtags = dto.hashtags || this.extractHashtags(dto.content || '');
        const mentions = this.extractMentions(dto.content || '');
        let status = 'PS_DRAFT';
        if (dto.publishAt && new Date(dto.publishAt) > new Date()) {
            status = 'PS_SCHEDULED';
        }
        else if (!dto.publishAt) {
            status = 'PS_ACTIVE';
        }
        const dbPostType = POST_TYPE_DB_MAP[dto.postType] ?? 'PT_TEXT';
        const dbVisibility = VISIBILITY_DB_MAP[dto.visibility || ''] ?? 'VIS_PUBLIC';
        const pollConfig = dto.pollConfig || {};
        pollConfig._extPostType = dto.postType;
        if (dto.pollOptions?.length)
            pollConfig.options = dto.pollOptions;
        if (dto.productName !== undefined)
            pollConfig.productName = dto.productName;
        if (dto.productPrice !== undefined)
            pollConfig.productPrice = dto.productPrice;
        if (dto.badgeText !== undefined)
            pollConfig.badgeText = dto.badgeText;
        if (dto.rating !== undefined)
            pollConfig.rating = dto.rating;
        if (dto.reqCategory !== undefined)
            pollConfig.reqCategory = dto.reqCategory;
        if (dto.reqQuantity !== undefined)
            pollConfig.reqQuantity = dto.reqQuantity;
        if (dto.budgetMin !== undefined)
            pollConfig.budgetMin = dto.budgetMin;
        if (dto.budgetMax !== undefined)
            pollConfig.budgetMax = dto.budgetMax;
        if (dto.deadline !== undefined)
            pollConfig.deadline = dto.deadline;
        const post = await this.prisma.platform.marketplacePost.create({
            data: {
                tenantId,
                authorId,
                postType: dbPostType,
                content: dto.content,
                mediaUrls: dto.mediaUrls || [],
                linkedListingId: dto.linkedListingId,
                visibility: dbVisibility,
                visibilityConfig: dto.visibilityConfig,
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
    async getFeed(tenantId, pagination, userId) {
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
        let userEngagements = new Map();
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
                userEngagements.get(e.postId).add(e.action);
            });
        }
        const data = posts.map((post) => this.mapPostToResponse(post, userEngagements));
        return {
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(postId) {
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
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        await this.prisma.platform.marketplacePost.update({
            where: { id: postId },
            data: { viewCount: { increment: 1 } },
        });
        return this.mapPostToResponse(post);
    }
    async toggleLike(postId, userId, tenantId) {
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
    async toggleSave(postId, userId, tenantId) {
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
    async addComment(postId, userId, tenantId, content, parentId) {
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
    async trackShare(postId, userId, tenantId, sharedTo) {
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
    mapPostToResponse(post, userEngagements) {
        const meta = post.pollConfig || {};
        const extPostType = meta._extPostType || this.dbTypeToFrontend(post.postType);
        return {
            ...post,
            postType: extPostType,
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
    dbTypeToFrontend(dbType) {
        const reverse = {
            PT_TEXT: 'TEXT',
            PT_IMAGE: 'IMAGE',
            PT_VIDEO: 'VIDEO',
            PT_PRODUCT_SHARE: 'PRODUCT_SHARE',
            PT_ANNOUNCEMENT: 'ANNOUNCEMENT',
            PT_POLL: 'POLL',
            PT_JOB_POSTING: 'TEXT',
            PT_NEWS: 'TEXT',
        };
        return reverse[dbType] ?? 'TEXT';
    }
    async findPostOrFail(postId) {
        const post = await this.prisma.platform.marketplacePost.findUnique({
            where: { id: postId },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    extractHashtags(content) {
        const matches = content.match(/#(\w+)/g);
        return matches ? matches.map((m) => m.slice(1).toLowerCase()) : [];
    }
    extractMentions(content) {
        const matches = content.match(/@(\w+)/g);
        return matches ? matches.map((m) => m.slice(1)) : [];
    }
};
exports.PostService = PostService;
exports.PostService = PostService = PostService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostService);
//# sourceMappingURL=post.service.js.map