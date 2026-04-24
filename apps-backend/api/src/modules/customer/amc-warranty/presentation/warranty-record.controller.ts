import { Controller, Get, Post, Param, Body, Query, Req } from '@nestjs/common';
import { WarrantyRecordService } from '../services/warranty-record.service';

@Controller('warranty/records')
export class WarrantyRecordController {
  constructor(private readonly svc: WarrantyRecordService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, q);
  }

  @Get('expiring')
  expiring(@Req() req: any, @Query('days') days: string) {
    return this.svc.findExpiring(req.user.tenantId, days ? +days : 30);
  }

  @Get('check/:serialId')
  checkSerial(@Req() req: any, @Param('serialId') s: string) {
    return this.svc.checkBySerial(req.user.tenantId, s);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findById(req.user.tenantId, id);
  }

  @Post(':id/extend')
  extend(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.extend(req.user.tenantId, id, dto);
  }
}
