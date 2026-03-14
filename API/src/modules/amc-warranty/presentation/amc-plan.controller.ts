import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { AMCPlanService } from '../services/amc-plan.service';

@Controller('amc/plans')
export class AMCPlanController {
  constructor(private readonly svc: AMCPlanService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.svc.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(req.user.tenantId, id, dto);
  }

  @Post(':id/import')
  importPlan(@Req() req: any, @Param('id') id: string) {
    return this.svc.importSystemPlan(req.user.tenantId, id);
  }
}
