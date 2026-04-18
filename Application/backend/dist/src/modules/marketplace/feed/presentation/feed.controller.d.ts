import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreatePostDto } from './dto/create-post.dto';
export declare class FeedController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    getFeed(userId: string, tenantId: string, page?: string, limit?: string, category?: string, city?: string): Promise<ApiResponse<any>>;
    getFollowingFeed(userId: string, tenantId: string, page?: string, limit?: string): Promise<ApiResponse<any>>;
    getTrendingFeed(userId: string, tenantId: string, page?: string, limit?: string): Promise<ApiResponse<any>>;
    getDiscoverFeed(userId: string, tenantId: string, page?: string, limit?: string, category?: string): Promise<ApiResponse<any>>;
    getPostsFeed(userId: string, tenantId: string, page?: string, limit?: string, postType?: string, authorId?: string): Promise<ApiResponse<unknown[]>>;
    createPost(dto: CreatePostDto, userId: string, tenantId: string): Promise<ApiResponse<{
        id: any;
    }>>;
    engagePost(postId: string, body: {
        action: string;
        sharedTo?: string;
        city?: string;
        state?: string;
        deviceType?: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<null>>;
    followUser(followingId: string, followerId: string, tenantId: string): Promise<ApiResponse<any>>;
    unfollowUser(followingId: string, followerId: string, tenantId: string): Promise<ApiResponse<any>>;
    getFollowers(userId: string, tenantId: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    getFollowing(userId: string, tenantId: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    getShareLink(entityType: 'listing' | 'post' | 'offer', entityId: string, tenantId: string): Promise<ApiResponse<any>>;
}
