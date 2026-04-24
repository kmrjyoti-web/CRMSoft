import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureFlagsService } from './feature-flags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class ToggleFeatureDto {
  @IsBoolean() isEnabled: boolean;
  @IsOptional() @IsObject() config?: Record<string, unknown>;
}

class BulkFeatureItem {
  @IsString() featureCode: string;
  @IsBoolean() isEnabled: boolean;
}

class BulkSetDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => BulkFeatureItem)
  features: BulkFeatureItem[];
}

@ApiTags('feature-flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private featureFlagsService: FeatureFlagsService) {}

  /** List all available features (global catalog) */
  @Get('available')
  getAvailableFeatures() {
    return this.featureFlagsService.getAvailableFeatures();
  }

  /** Cross-partner dashboard — most enabled features */
  @Get('dashboard')
  getDashboard() {
    return this.featureFlagsService.getDashboard();
  }

  /** Get all feature flags for a partner with enabled status */
  @Get('partner/:partnerId')
  getByPartner(@Param('partnerId') partnerId: string) {
    return this.featureFlagsService.getByPartner(partnerId);
  }

  /** Get only enabled feature codes (lightweight — used by partner's CRM on startup) */
  @Get('partner/:partnerId/enabled')
  getEnabled(@Param('partnerId') partnerId: string) {
    return this.featureFlagsService.getEnabled(partnerId);
  }

  /** Toggle a single feature flag */
  @Patch('partner/:partnerId/:featureCode')
  toggle(
    @Param('partnerId') partnerId: string,
    @Param('featureCode') featureCode: string,
    @Body() dto: ToggleFeatureDto,
  ) {
    return this.featureFlagsService.toggle(partnerId, featureCode, dto.isEnabled, dto.config);
  }

  /** Bulk set multiple feature flags at once */
  @Post('partner/:partnerId/bulk')
  bulkSet(@Param('partnerId') partnerId: string, @Body() dto: BulkSetDto) {
    return this.featureFlagsService.bulkSet(partnerId, dto.features);
  }

  /** Enable all features for a partner */
  @Post('partner/:partnerId/enable-all')
  enableAll(@Param('partnerId') partnerId: string) {
    return this.featureFlagsService.enableAll(partnerId);
  }

  /** Disable all features for a partner */
  @Post('partner/:partnerId/disable-all')
  disableAll(@Param('partnerId') partnerId: string) {
    return this.featureFlagsService.disableAll(partnerId);
  }
}
