import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { SchedulingService } from '../services/scheduling.service';
import { CreateScheduledEventDto, EventParticipantDto } from './dto/create-event.dto';
import { UpdateScheduledEventDto } from './dto/update-event.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { EventQueryDto } from './dto/event-query.dto';

@Controller('calendar/events')
export class CalendarEventsController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Post()
  @RequirePermissions('calendar:write')
  async create(
    @Body() dto: CreateScheduledEventDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('roleLevel') roleLevel: number,
  ) {
    const result = await this.scheduling.createEvent(dto, userId, tenantId, roleLevel);
    return ApiResponse.success(result, 'Event created successfully');
  }

  @Get()
  @RequirePermissions('calendar:read')
  async list(
    @Query() query: EventQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('roleLevel') roleLevel: number,
  ) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = parseInt(query.limit ?? '20', 10);
    const { data, total } = await this.scheduling.listEvents(userId, tenantId, roleLevel, page, limit, query);
    return ApiResponse.paginated(data, total, page, limit);
  }

  @Get(':id')
  @RequirePermissions('calendar:read')
  async getById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('roleLevel') roleLevel: number,
  ) {
    const result = await this.scheduling.getEventById(id, userId, tenantId, roleLevel);
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('calendar:write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduledEventDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.scheduling.updateEvent(id, dto, userId, tenantId);
    return ApiResponse.success(result, 'Event updated successfully');
  }

  @Delete(':id')
  @RequirePermissions('calendar:write')
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.scheduling.cancelEvent(id, reason, userId, tenantId);
    return ApiResponse.success(result, 'Event cancelled successfully');
  }

  @Post(':id/reschedule')
  @RequirePermissions('calendar:write')
  async reschedule(
    @Param('id') id: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.scheduling.rescheduleEvent(id, startTime, endTime, userId, tenantId);
    return ApiResponse.success(result, 'Event rescheduled successfully');
  }

  @Post(':id/participants')
  @RequirePermissions('calendar:write')
  async addParticipant(
    @Param('id') eventId: string,
    @Body() participantDto: EventParticipantDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.scheduling.addParticipant(eventId, participantDto, userId, tenantId);
    return ApiResponse.success(result, 'Participant added successfully');
  }

  @Delete(':id/participants/:uid')
  @RequirePermissions('calendar:write')
  async removeParticipant(
    @Param('id') eventId: string,
    @Param('uid') participantUserId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.scheduling.removeParticipant(eventId, participantUserId, userId, tenantId);
    return ApiResponse.success(null, 'Participant removed successfully');
  }

  @Post(':id/rsvp')
  @RequirePermissions('calendar:read')
  async updateRsvp(
    @Param('id') eventId: string,
    @Body() dto: RsvpDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.scheduling.updateRSVP(eventId, userId, dto.rsvpStatus, tenantId);
    return ApiResponse.success(result, 'RSVP updated successfully');
  }

  @Get(':id/history')
  @RequirePermissions('calendar:read')
  async getHistory(
    @Param('id') eventId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.scheduling.getEventHistory(eventId, tenantId);
    return ApiResponse.success(result);
  }
}
