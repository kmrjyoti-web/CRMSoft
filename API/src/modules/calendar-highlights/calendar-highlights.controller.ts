import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CalendarHighlightsService } from './calendar-highlights.service';

@Controller('api/v1/calendar/highlights')
@UseGuards(JwtAuthGuard)
export class CalendarHighlightsController {
  constructor(private svc: CalendarHighlightsService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('types') types?: string,
  ) {
    const tenantId = req.user?.tenantId ?? '';
    const typeArr = types ? types.split(',') : undefined;
    const data = await this.svc.getHighlights(tenantId, from, to, typeArr);
    return { success: true, data };
  }

  @Get('holidays')
  async holidays(@Req() req: any, @Query('year') year: string) {
    const tenantId = req.user?.tenantId ?? '';
    const data = await this.svc.getHolidays(tenantId, parseInt(year) || new Date().getFullYear());
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const tenantId = req.user?.tenantId ?? '';
    const data = await this.svc.create(tenantId, body);
    return { success: true, data };
  }
}
