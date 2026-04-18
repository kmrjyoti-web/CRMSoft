import { PrismaService } from '../../../core/prisma/prisma.service';
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
    pollOptions?: {
        text: string;
    }[];
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
export declare class PostService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(tenantId: string, authorId: string, dto: CreatePostDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/platform-client").$Enums.PostStatus;
        expiresAt: Date | null;
        publishedAt: Date | null;
        content: string | null;
        viewCount: number;
        visibility: import("@prisma/platform-client").$Enums.VisibilityType;
        authorId: string;
        mediaUrls: import("@prisma/platform-client/runtime/library").JsonValue;
        visibilityConfig: import("@prisma/platform-client/runtime/library").JsonValue | null;
        publishAt: Date | null;
        expiryAction: import("@prisma/platform-client").$Enums.ExpiryAction;
        postType: import("@prisma/platform-client").$Enums.PostType;
        linkedListingId: string | null;
        likeCount: number;
        commentCount: number;
        shareCount: number;
        saveCount: number;
        hashtags: string[];
        mentions: string[];
        pollConfig: import("@prisma/platform-client/runtime/library").JsonValue | null;
    }>;
    getFeed(tenantId: string, pagination: {
        page: number;
        limit: number;
    }, userId?: string): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(postId: string): Promise<any>;
    toggleLike(postId: string, userId: string, tenantId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    toggleSave(postId: string, userId: string, tenantId: string): Promise<{
        saved: boolean;
    }>;
    addComment(postId: string, userId: string, tenantId: string, content: string, parentId?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string;
        parentId: string | null;
        content: string;
        isEdited: boolean;
        likeCount: number;
        postId: string;
    }>;
    trackShare(postId: string, userId: string, tenantId: string, sharedTo: string): Promise<{
        success: boolean;
    }>;
    private mapPostToResponse;
    private dbTypeToFrontend;
    private findPostOrFail;
    private extractHashtags;
    private extractMentions;
}
export {};
