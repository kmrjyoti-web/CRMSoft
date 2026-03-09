import { Controller, Get, Put, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import { BusinessHoursService } from '../services/business-hours.service';
import {
  UpdateBusinessHoursDto,
  UpdateWeekScheduleDto,
} from './dto/update-business-hours.dto';

@ApiTags('Settings - Business Hours')
@Controller('settings/business-hours')
export class BusinessHoursController {
  constructor(private readonly service: BusinessHoursService) {}

  /** Get full week schedule. */
  @Get()
  getWeek(@Req() req: any) {
    return this.service.getWeekSchedule(req.user.tenantId);
  }

  /** Update full week schedule (bulk). */
  @Put()
  updateWeek(@Req() req: any, @Body() dto: UpdateWeekScheduleDto) {
    return this.service.updateWeek(req.user.tenantId, dto.schedules);
  }

  /** Update a single day's schedule. */
  @Put(':day')
  updateDay(
    @Req() req: any,
    @Param('day') day: DayOfWeek,
    @Body() dto: UpdateBusinessHoursDto,
  ) {
    return this.service.updateDay(req.user.tenantId, day, dto);
  }

  /** Check if currently within business hours. */
  @Get('is-working-now')
  isWorkingNow(@Req() req: any) {
    return this.service.isWorkingNow(req.user.tenantId).then((working) => ({ working }));
  }
}
