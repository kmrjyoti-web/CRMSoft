import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AvailabilityService } from '../services/availability.service';
import { SetWorkingHoursDto } from './dto/working-hours.dto';
import { CreateBlockedSlotDto, ListBlockedSlotsQueryDto } from './dto/blocked-slot.dto';
import { FreeSlotsQueryDto, ConflictCheckDto } from './dto/free-slots-query.dto';

@Controller('calendar/availability')
export class CalendarAvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /* ------------------------------------------------------------------ */
  /*  Working Hours                                                      */
  /* ------------------------------------------------------------------ */

  @Put('working-hours')
  @RequirePermissions('calendar:write')
  async setWorkingHours(
    @Body() dto: SetWorkingHoursDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.setWorkingHours(
      userId,
      tenantId,
      dto.hours,
      dto.timezone,
    );
    return ApiResponse.success(result, 'Working hours updated');
  }

  @Get('working-hours')
  @RequirePermissions('calendar:read')
  async getOwnWorkingHours(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.getWorkingHours(userId, tenantId);
    return ApiResponse.success(result);
  }

  @Get('working-hours/:userId')
  @RequirePermissions('calendar:read')
  async getUserWorkingHours(
    @Param('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.getWorkingHours(userId, tenantId);
    return ApiResponse.success(result);
  }

  /* ------------------------------------------------------------------ */
  /*  Blocked Slots                                                      */
  /* ------------------------------------------------------------------ */

  @Post('blocked-slots')
  @RequirePermissions('calendar:write')
  async createBlockedSlot(
    @Body() dto: CreateBlockedSlotDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.createBlockedSlot(
      userId,
      tenantId,
      dto,
    );
    return ApiResponse.success(result, 'Blocked slot created');
  }

  @Get('blocked-slots')
  @RequirePermissions('calendar:read')
  async listBlockedSlots(
    @Query() query: ListBlockedSlotsQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.listBlockedSlots(
      userId,
      tenantId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
    return ApiResponse.success(result);
  }

  @Delete('blocked-slots/:id')
  @RequirePermissions('calendar:write')
  async deleteBlockedSlot(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.availabilityService.deleteBlockedSlot(id, userId, tenantId);
    return ApiResponse.success(null, 'Blocked slot deleted');
  }

  /* ------------------------------------------------------------------ */
  /*  Conflicts & Free Slots                                             */
  /* ------------------------------------------------------------------ */

  @Post('check-conflicts')
  @RequirePermissions('calendar:read')
  async checkConflicts(
    @Body() dto: ConflictCheckDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.checkConflicts(
      userId,
      tenantId,
      new Date(dto.startTime),
      new Date(dto.endTime),
      dto.excludeEventId,
    );
    return ApiResponse.success(result);
  }

  @Post('free-slots')
  @RequirePermissions('calendar:read')
  async findFreeSlots(
    @Body() dto: FreeSlotsQueryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.availabilityService.findFreeSlots(
      dto.userIds,
      tenantId,
      new Date(dto.date),
      dto.durationMinutes,
      dto.timezone,
    );
    return ApiResponse.success(result);
  }
}
