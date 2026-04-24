import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/creator')
export class CreatorController {
  constructor(private readonly svc: CreatorService) {}

  // ─── Brand profile (public lookup for login resolver) ─────────────────────

  @Get('brand/:code')
  getBrandByCode(@Param('code') code: string) {
    return this.svc.getBrandByCode(code);
  }

  // ─── Vertical list / detail ────────────────────────────────────────────────

  @Get('verticals')
  listVerticals() {
    return this.svc.listVerticals();
  }

  @Get('verticals/:code')
  getVertical(@Param('code') code: string) {
    return this.svc.getVertical(code);
  }

  @Patch('verticals/:code')
  updateVertical(
    @Param('code') code: string,
    @Body() body: { is_active?: boolean; is_beta?: boolean; is_coming_soon?: boolean },
  ) {
    return this.svc.updateVerticalFlags(code, body);
  }

  // ─── Vertical ─────────────────────────────────────────────────────────────

  @Get('vertical/validate')
  validateVerticalCode(@Query('code') code: string) {
    return this.svc.validateVerticalCode(code);
  }

  @Post('vertical')
  createVertical(@Body() body: {
    vertical_code: string;
    vertical_name: string;
    display_name: string;
    description?: string;
    icon_name?: string;
    color_theme?: string;
    folder_path: string;
    package_name: string;
    api_prefix: string;
    database_schemas?: string[];
    base_price?: number | null;
    per_user_price?: number | null;
    currency?: string;
    is_active?: boolean;
    is_beta?: boolean;
    is_coming_soon?: boolean;
    sort_order?: number;
  }) {
    return this.svc.createVertical(body);
  }

  // ─── Module ───────────────────────────────────────────────────────────────

  @Get('vertical/:code/modules')
  getModules(@Param('code') code: string) {
    return this.svc.getModulesForVertical(code);
  }

  @Get('vertical/:code/module/validate')
  validateModuleCode(@Param('code') code: string, @Query('code') moduleCode: string) {
    return this.svc.validateModuleCode(code, moduleCode);
  }

  @Post('vertical/:code/module')
  createModule(@Param('code') code: string, @Body() body: {
    module_code: string;
    module_name: string;
    display_name: string;
    description?: string;
    icon_name?: string;
    color_theme?: string;
    sort_order?: number;
    is_required?: boolean;
    is_default_enabled?: boolean;
    is_premium?: boolean;
    package_path?: string;
    api_namespace?: string;
    db_tables?: string[];
    depends_on?: string[];
    conflicts_with?: string[];
    addon_price?: number | null;
    per_user_addon?: number | null;
  }) {
    return this.svc.createModule(code, body);
  }

  @Patch('module/:id')
  updateModule(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.svc.updateModule(id, body);
  }

  @Delete('module/:id')
  deleteModule(@Param('id') id: string) {
    return this.svc.deleteModule(id);
  }

  // ─── Feature ──────────────────────────────────────────────────────────────

  @Get('vertical/:code/feature/validate')
  validateFeatureCode(@Param('code') code: string, @Query('code') featureCode: string) {
    return this.svc.validateFeatureCode(code, featureCode);
  }

  @Post('vertical/:code/feature')
  createFeature(@Param('code') code: string, @Body() body: {
    feature_code: string;
    feature_name: string;
    description?: string;
    category?: string;
    sub_category?: string;
    module_code?: string;
    is_default_enabled?: boolean;
    is_premium?: boolean;
    is_beta?: boolean;
    is_experimental?: boolean;
    addon_price?: number | null;
    sort_order?: number;
  }) {
    return this.svc.createFeature(code, body);
  }

  @Patch('feature/:id')
  updateFeature(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.svc.updateFeature(id, body);
  }

  @Delete('feature/:id')
  deleteFeature(@Param('id') id: string) {
    return this.svc.deleteFeature(id);
  }
}
