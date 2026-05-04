import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { ServiceVisitService } from '../services/service-visit.service';

@Controller('service-visits')
export class ServiceVisitController {
  constructor(private readonly svc: ServiceVisitService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, q);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findById(req.user.tenantId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.svc.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(req.user.tenantId, id, dto);
  }
}
