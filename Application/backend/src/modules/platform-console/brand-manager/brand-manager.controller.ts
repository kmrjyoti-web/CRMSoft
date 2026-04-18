import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BrandManagerService } from './brand-manager.service';
import { WhitelistModuleDto } from './dto/whitelist-module.dto';
import { SetFeatureFlagDto } from './dto/set-feature-flag.dto';

@Controller('platform-console/brands')
export class BrandManagerController {
  constructor(private readonly brandManagerService: BrandManagerService) {}

  // Static routes first
  @Get('errors/overview')
  getErrorOverview() {
    return this.brandManagerService.getErrorOverview();
  }

  @Get()
  getBrands() {
    return this.brandManagerService.getBrands();
  }

  @Get(':brandId')
  getBrandDetail(@Param('brandId') brandId: string) {
    return this.brandManagerService.getBrandDetail(brandId);
  }

  @Get(':brandId/modules')
  getModules(@Param('brandId') brandId: string) {
    return this.brandManagerService.getModules(brandId);
  }

  @Post(':brandId/modules')
  whitelistModule(@Param('brandId') brandId: string, @Body() dto: WhitelistModuleDto) {
    return this.brandManagerService.whitelistModule(brandId, dto);
  }

  @Patch(':brandId/modules/:id')
  updateModule(@Param('id') id: string, @Body() body: { status?: string; trialExpiresAt?: string }) {
    return this.brandManagerService.updateModule(id, body);
  }

  @Delete(':brandId/modules/:id')
  removeModule(@Param('id') id: string) {
    return this.brandManagerService.removeModule(id);
  }

  @Get(':brandId/features')
  getFeatures(@Param('brandId') brandId: string) {
    return this.brandManagerService.getFeatures(brandId);
  }

  @Post(':brandId/features')
  setFeatureFlag(@Param('brandId') brandId: string, @Body() dto: SetFeatureFlagDto) {
    return this.brandManagerService.setFeatureFlag(brandId, dto);
  }

  @Patch(':brandId/features/:id')
  updateFeatureFlag(@Param('id') id: string, @Body() body: { isEnabled?: boolean; config?: Record<string, unknown> }) {
    return this.brandManagerService.updateFeatureFlag(id, body);
  }

  @Delete(':brandId/features/:id')
  removeFeatureFlag(@Param('id') id: string) {
    return this.brandManagerService.removeFeatureFlag(id);
  }

  @Get(':brandId/errors')
  getBrandErrors(@Param('brandId') brandId: string) {
    return this.brandManagerService.getBrandErrors(brandId);
  }
}
