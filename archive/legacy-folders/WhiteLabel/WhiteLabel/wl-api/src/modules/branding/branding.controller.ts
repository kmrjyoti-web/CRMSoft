import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('branding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('branding')
export class BrandingController {
  constructor(private brandingService: BrandingService) {}

  @Post()
  create(@Body() dto: any) { return this.brandingService.create(dto); }

  @Get('by-domain/:domain')
  getByDomain(@Param('domain') domain: string) { return this.brandingService.getByDomain(domain); }

  @Get(':partnerId')
  getByPartner(@Param('partnerId') partnerId: string) { return this.brandingService.getByPartner(partnerId); }

  @Patch(':partnerId')
  update(@Param('partnerId') partnerId: string, @Body() dto: any) { return this.brandingService.update(partnerId, dto); }
}
