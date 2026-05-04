import { Controller, Get, Post, Param, Body, Query, Req } from '@nestjs/common';
import { AMCContractService } from '../services/amc-contract.service';

@Controller('amc/contracts')
export class AMCContractController {
  constructor(private readonly svc: AMCContractService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user.tenantId, q);
  }

  @Get('expiring')
  expiring(@Req() req: any, @Query('days') days: string) {
    return this.svc.findExpiring(req.user.tenantId, days ? +days : 30);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findById(req.user.tenantId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.svc.create(req.user.tenantId, dto);
  }

  @Post(':id/activate')
  activate(@Req() req: any, @Param('id') id: string) {
    return this.svc.activate(req.user.tenantId, id);
  }

  @Post(':id/renew')
  renew(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.renew(req.user.tenantId, id, dto);
  }
}
