import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TrackEventCommand } from '../application/commands/track-event/track-event.command';
import { GetAnalyticsQuery } from '../application/queries/get-analytics/get-analytics.query';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('Marketplace - Analytics')
@ApiBearerAuth()
@Controller('marketplace/analytics')
export class AnalyticsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('track')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track an analytics event (impression, click, enquiry, order, etc.)' })
  async track(
    @Body() dto: TrackEventDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(
      new TrackEventCommand(
        tenantId,
        dto.entityType,
        dto.entityId,
        dto.eventType,
        userId,
        dto.source,
        dto.deviceType,
        dto.city,
        dto.state,
        dto.pincode,
        dto.orderValue,
        dto.metadata,
      ),
    );
    return ApiResponse.success(null, 'Event tracked');
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get analytics summary for an entity' })
  async getAnalytics(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetAnalyticsQuery(tenantId, entityType.toUpperCase(), entityId),
    );
    return ApiResponse.success(result);
  }
}
