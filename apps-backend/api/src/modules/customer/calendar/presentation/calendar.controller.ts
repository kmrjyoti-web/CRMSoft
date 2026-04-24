import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CalendarService } from '../calendar.service';
import { UnifiedCalendarService } from '../services/unified-calendar.service';
import { CalendarQueryDto, TeamCalendarQueryDto, UnifiedCalendarQueryDto } from './dto/calendar-query.dto';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly unifiedCalendar: UnifiedCalendarService,
  ) {}

  @Get()
  @RequirePermissions('calendar:read')
  async getEvents(
    @Query() query: CalendarQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.calendarService.getCalendarEvents(
      tenantId, userId, new Date(query.startDate), new Date(query.endDate), query.eventTypes,
    );
    return ApiResponse.success(result);
  }

  @Get('unified')
  @RequirePermissions('calendar:read')
  async unifiedView(
    @Query() query: UnifiedCalendarQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('roleLevel') roleLevel: number,
  ) {
    const targetUserId = query.userId ?? userId;
    const result = await this.unifiedCalendar.getUnifiedView(
      targetUserId, tenantId, roleLevel,
      new Date(query.startDate), new Date(query.endDate),
      query.sources, query.search,
    );
    return ApiResponse.success(result);
  }

  @Get('agenda')
  @RequirePermissions('calendar:read')
  async agendaView(
    @Query() query: UnifiedCalendarQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('roleLevel') roleLevel: number,
  ) {
    const targetUserId = query.userId ?? userId;
    const events = await this.unifiedCalendar.getUnifiedView(
      targetUserId, tenantId, roleLevel,
      new Date(query.startDate), new Date(query.endDate),
      query.sources, query.search,
    );

    // Group events by day for agenda view
    const grouped: Record<string, typeof events> = {};
    for (const event of events) {
      const dayKey = event.startTime.toISOString().slice(0, 10);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(event);
    }

    const agenda = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({ date, events: items }));

    return ApiResponse.success(agenda);
  }

  @Get('stats')
  @RequirePermissions('calendar:read')
  async stats(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('roleLevel') roleLevel: number,
  ) {
    const result = await this.unifiedCalendar.getStats(userId, tenantId, roleLevel);
    return ApiResponse.success(result);
  }

  @Get('day/:date')
  @RequirePermissions('calendar:read')
  async dayView(
    @Param('date') date: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.calendarService.getDayView(tenantId, userId, new Date(date));
    return ApiResponse.success(result);
  }

  @Get('week/:date')
  @RequirePermissions('calendar:read')
  async weekView(
    @Param('date') date: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.calendarService.getWeekView(tenantId, userId, new Date(date));
    return ApiResponse.success(result);
  }

  @Get('month/:year/:month')
  @RequirePermissions('calendar:read')
  async monthView(
    @Param('year') year: string,
    @Param('month') month: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.calendarService.getMonthView(tenantId, userId, +year, +month);
    return ApiResponse.success(result);
  }

  @Get('availability/:userId/:date')
  @RequirePermissions('calendar:read')
  async availability(
    @Param('userId') targetUserId: string,
    @Param('date') date: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.calendarService.getAvailability(tenantId, targetUserId, new Date(date));
    return ApiResponse.success(result);
  }

  @Get('team')
  @RequirePermissions('calendar:read')
  async teamCalendar(
    @Query() query: TeamCalendarQueryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.calendarService.getTeamCalendar(
      tenantId, query.userIds, new Date(query.startDate), new Date(query.endDate),
    );
    return ApiResponse.success(result);
  }
}
