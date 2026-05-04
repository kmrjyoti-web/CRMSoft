import { Controller, Get, Post, Param, Body, Query, Req } from '@nestjs/common';
import { AMCScheduleService } from '../services/amc-schedule.service';

@Controller('amc/schedules')
export class AMCScheduleController {
  constructor(private readonly svc: AMCScheduleService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, {
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
      status: q.status,
    });
  }

  @Post(':id/complete')
  complete(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.complete(req.user.tenantId, id, dto);
  }

  @Post(':id/reschedule')
  reschedule(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.reschedule(req.user.tenantId, id, new Date(dto.newDate));
  }
}
