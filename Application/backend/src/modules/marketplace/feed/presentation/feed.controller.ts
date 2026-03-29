import {
  Controller, Get, Post, Delete, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreatePostCommand } from '../application/commands/create-post/create-post.command';
import { EngagePostCommand } from '../application/commands/engage-post/engage-post.command';
import { FollowUserCommand } from '../application/commands/follow-user/follow-user.command';
import { UnfollowUserCommand } from '../application/commands/unfollow-user/unfollow-user.command';
import { GetFeedQuery } from '../application/queries/get-feed/get-feed.query';
import { GetRankedFeedQuery } from '../application/queries/get-ranked-feed/get-ranked-feed.query';
import { GetFollowersQuery } from '../application/queries/get-followers/get-followers.query';
import { GetFollowingQuery } from '../application/queries/get-following/get-following.query';
import { GetShareLinkQuery } from '../application/queries/get-share-link/get-share-link.query';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('Marketplace - Feed')
@ApiBearerAuth()
@Controller('marketplace')
export class FeedController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ─── Feed Endpoints ───────────────────────────────────────────────────────

  @Get('feed')
  @ApiOperation({ summary: 'Get ranked main feed' })
  async getFeed(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetRankedFeedQuery(
        tenantId,
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        category,
        city,
        'main',
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('feed/following')
  @ApiOperation({ summary: 'Get feed from followed users' })
  async getFollowingFeed(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetRankedFeedQuery(
        tenantId,
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        undefined,
        undefined,
        'following',
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('feed/trending')
  @ApiOperation({ summary: 'Get trending feed (last 24h)' })
  async getTrendingFeed(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetRankedFeedQuery(
        tenantId,
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        undefined,
        undefined,
        'trending',
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('feed/discover')
  @ApiOperation({ summary: 'Discover new content' })
  async getDiscoverFeed(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetRankedFeedQuery(
        tenantId,
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        category,
        undefined,
        'discover',
      ),
    );
    return ApiResponse.success(result);
  }

  /** Legacy feed endpoint — preserved for backwards compatibility */
  @Get('feed/posts')
  @ApiOperation({ summary: 'Get marketplace posts feed (legacy)' })
  async getPostsFeed(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('postType') postType?: string,
    @Query('authorId') authorId?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetFeedQuery(
        tenantId,
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        postType,
        authorId,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  // ─── Post Endpoints ───────────────────────────────────────────────────────

  @Post('feed/posts')
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const id = await this.commandBus.execute(
      new CreatePostCommand(
        tenantId,
        userId,
        userId,
        dto.postType,
        dto.content,
        dto.mediaUrls,
        dto.linkedListingId,
        dto.linkedOfferId,
        dto.rating,
        dto.productId,
        dto.visibility,
        dto.visibilityConfig,
        dto.publishAt ? new Date(dto.publishAt) : undefined,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        dto.hashtags,
        dto.mentions,
        dto.pollConfig,
      ),
    );
    return ApiResponse.success({ id }, 'Post created');
  }

  @Post('feed/posts/:id/engage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Engage with a post (like, share, save, view)' })
  async engagePost(
    @Param('id') postId: string,
    @Body() body: {
      action: string;
      sharedTo?: string;
      city?: string;
      state?: string;
      deviceType?: string;
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(
      new EngagePostCommand(
        postId,
        tenantId,
        userId,
        body.action,
        body.sharedTo,
        body.city,
        body.state,
        body.deviceType,
      ),
    );
    return ApiResponse.success(null, 'Engagement recorded');
  }

  // ─── Follow Endpoints ─────────────────────────────────────────────────────

  @Post('follow/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(
    @Param('userId') followingId: string,
    @CurrentUser('id') followerId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new FollowUserCommand(tenantId, followerId, followingId),
    );
    return ApiResponse.success(result, 'Following user');
  }

  @Delete('follow/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(
    @Param('userId') followingId: string,
    @CurrentUser('id') followerId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new UnfollowUserCommand(tenantId, followerId, followingId),
    );
    return ApiResponse.success(result, 'Unfollowed user');
  }

  @Get('follow/followers')
  @ApiOperation({ summary: 'Get your followers' })
  async getFollowers(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetFollowersQuery(
        userId,
        tenantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Get('follow/following')
  @ApiOperation({ summary: 'Get users you follow' })
  async getFollowing(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetFollowingQuery(
        userId,
        tenantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  // ─── Share Deep Links ─────────────────────────────────────────────────────

  @Post('share/:entityType/:entityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get share links (web, deep link, WhatsApp)' })
  async getShareLink(
    @Param('entityType') entityType: 'listing' | 'post' | 'offer',
    @Param('entityId') entityId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetShareLinkQuery(entityType, entityId, tenantId),
    );
    return ApiResponse.success(result);
  }
}
