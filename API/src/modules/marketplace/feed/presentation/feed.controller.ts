import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreatePostCommand } from '../application/commands/create-post/create-post.command';
import { EngagePostCommand } from '../application/commands/engage-post/engage-post.command';
import { GetFeedQuery } from '../application/queries/get-feed/get-feed.query';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('Marketplace - Feed')
@ApiBearerAuth()
@Controller('marketplace/feed')
export class FeedController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get marketplace social feed' })
  async getFeed(
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

  @Post('posts')
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

  @Post('posts/:id/engage')
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
}
