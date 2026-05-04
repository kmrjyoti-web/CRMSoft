import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateReviewCommand } from '../application/commands/create-review/create-review.command';
import { ModerateReviewCommand } from '../application/commands/moderate-review/moderate-review.command';
import { ListReviewsQuery } from '../application/queries/list-reviews/list-reviews.query';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Marketplace - Reviews')
@ApiBearerAuth()
@Controller('marketplace/reviews')
export class ReviewsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a product review' })
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const review = await this.commandBus.execute(
      new CreateReviewCommand(
        tenantId,
        dto.listingId,
        userId,
        dto.rating,
        dto.title,
        dto.body,
        dto.mediaUrls,
        dto.orderId,
      ),
    );
    return ApiResponse.success(review, 'Review submitted');
  }

  @Get()
  @ApiOperation({ summary: 'List reviews' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('listingId') listingId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListReviewsQuery(
        tenantId,
        listingId,
        undefined,
        status,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a review (moderator)' })
  async approve(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new ModerateReviewCommand(id, tenantId, userId, 'APPROVE', body.note));
    return ApiResponse.success(null, 'Review approved');
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a review (moderator)' })
  async reject(
    @Param('id') id: string,
    @Body() body: { note: string },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new ModerateReviewCommand(id, tenantId, userId, 'REJECT', body.note));
    return ApiResponse.success(null, 'Review rejected');
  }

  @Post(':id/flag')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Flag a review for investigation' })
  async flag(
    @Param('id') id: string,
    @Body() body: { note: string },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new ModerateReviewCommand(id, tenantId, userId, 'FLAG', body.note));
    return ApiResponse.success(null, 'Review flagged');
  }
}
