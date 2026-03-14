import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { WarrantyClaimService } from '../services/warranty-claim.service';

@Controller('warranty/claims')
export class WarrantyClaimController {
  constructor(private readonly svc: WarrantyClaimService) {}

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

  @Post(':id/reject')
  reject(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.reject(req.user.tenantId, id, dto.reason);
  }
}
