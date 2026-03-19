import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { WarrantyTemplateService } from '../services/warranty-template.service';

@Controller('warranty/templates')
export class WarrantyTemplateController {
  constructor(private readonly svc: WarrantyTemplateService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, q);
  }

  @Get('by-industry/:code')
  byIndustry(@Param('code') code: string) {
    return this.svc.findByIndustry(code);
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

  @Post(':id/import')
  importTemplate(@Req() req: any, @Param('id') id: string) {
    return this.svc.importSystemTemplate(req.user.tenantId, id);
  }
}
