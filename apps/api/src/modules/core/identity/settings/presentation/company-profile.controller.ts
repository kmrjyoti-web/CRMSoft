import { Controller, Get, Put, Patch, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompanyProfileService } from '../services/company-profile.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@ApiTags('Settings - Company Profile')
@Controller('settings/company')
export class CompanyProfileController {
  constructor(private readonly service: CompanyProfileService) {}

  /** Get full company profile. */
  @Get()
  get(@Req() req: any) {
    return this.service.get(req.user.tenantId);
  }

  /** Update company profile (full replace). */
  @Put()
  update(@Req() req: any, @Body() dto: UpdateCompanyProfileDto) {
    return this.service.update(req.user.tenantId, dto, req.user.id);
  }

  /** Partial update (inline edit — single field). */
  @Patch()
  patch(@Req() req: any, @Body() dto: UpdateCompanyProfileDto) {
    return this.service.update(req.user.tenantId, dto, req.user.id);
  }

  /** Get public company info (for quotation/invoice headers). */
  @Get('public')
  getPublic(@Req() req: any) {
    return this.service.getPublic(req.user.tenantId);
  }
}
