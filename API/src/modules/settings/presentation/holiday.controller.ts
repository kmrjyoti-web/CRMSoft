import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HolidayService } from '../services/holiday.service';
import { CreateHolidayDto, UpdateHolidayDto, HolidayQueryDto } from './dto/holiday.dto';

@ApiTags('Settings - Holidays')
@Controller('settings/holidays')
export class HolidayController {
  constructor(private readonly service: HolidayService) {}

  /** Add a holiday. */
  @Post()
  create(@Req() req: any, @Body() dto: CreateHolidayDto) {
    return this.service.create(req.user.tenantId, dto);
  }

  /** List all holidays (filterable by year). */
  @Get()
  list(@Req() req: any, @Query() query: HolidayQueryDto) {
    return this.service.list(req.user.tenantId, query.year, query.type);
  }

  /** Next 10 upcoming holidays. */
  @Get('upcoming')
  upcoming(@Req() req: any) {
    return this.service.upcoming(req.user.tenantId);
  }

  /** Update holiday. */
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.service.update(req.user.tenantId, id, dto as any);
  }

  /** Delete holiday. */
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.tenantId, id);
  }
}
