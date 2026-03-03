import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CalendarService } from '../calendar.service';
import { CalendarQueryDto, TeamCalendarQueryDto } from './dto/calendar-query.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @RequirePermissions('calendar:read')
  async getEvents(@Query() query: CalendarQueryDto, @CurrentUser('id') userId: string) {
    const result = await this.calendarService.getCalendarEvents(
      userId, new Date(query.startDate), new Date(query.endDate), query.eventTypes,
    );
    return ApiResponse.success(result);
  }

  @Get('day/:date')
  @RequirePermissions('calendar:read')
  async dayView(@Param('date') date: string, @CurrentUser('id') userId: string) {
    const result = await this.calendarService.getDayView(userId, new Date(date));
    return ApiResponse.success(result);
  }

  @Get('week/:date')
  @RequirePermissions('calendar:read')
  async weekView(@Param('date') date: string, @CurrentUser('id') userId: string) {
    const result = await this.calendarService.getWeekView(userId, new Date(date));
    return ApiResponse.success(result);
  }

  @Get('month/:year/:month')
  @RequirePermissions('calendar:read')
  async monthView(@Param('year') year: string, @Param('month') month: string, @CurrentUser('id') userId: string) {
    const result = await this.calendarService.getMonthView(userId, +year, +month);
    return ApiResponse.success(result);
  }

  @Get('availability/:userId/:date')
  @RequirePermissions('calendar:read')
  async availability(@Param('userId') userId: string, @Param('date') date: string) {
    const result = await this.calendarService.getAvailability(userId, new Date(date));
    return ApiResponse.success(result);
  }

  @Get('team')
  @RequirePermissions('calendar:read')
  async teamCalendar(@Query() query: TeamCalendarQueryDto) {
    const result = await this.calendarService.getTeamCalendar(
      query.userIds, new Date(query.startDate), new Date(query.endDate),
    );
    return ApiResponse.success(result);
  }
}
