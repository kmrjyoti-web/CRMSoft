import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { BrandConfigService } from './brand-config.service';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/brand-config')
export class BrandConfigController {
  constructor(private readonly service: BrandConfigService) {}

  // ─── Brand CRUD ──────────────────────────────────────────────────────────

  @Get()
  list() {
    return this.service.listBrands();
  }

  @Post()
  create(@Body() body: {
    brandCode: string;
    brandName: string;
    displayName: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    domain?: string;
    subdomain?: string;
    contactEmail?: string;
  }) {
    return this.service.createBrand(body);
  }

  @Get(':brandId')
  getBrand(@Param('brandId') brandId: string) {
    return this.service.getBrand(brandId);
  }

  @Patch(':brandId')
  updateBrand(@Param('brandId') brandId: string, @Body() body: Record<string, unknown>) {
    return this.service.updateBrand(brandId, body);
  }

  // ─── Vertical Assignments ────────────────────────────────────────────────

  @Get(':brandId/verticals')
  getVerticals(@Param('brandId') brandId: string) {
    return this.service.getVerticalsForBrand(brandId);
  }

  @Post(':brandId/verticals/:verticalCode/enable')
  enable(@Param('brandId') brandId: string, @Param('verticalCode') code: string) {
    return this.service.enableVerticalForBrand(brandId, code);
  }

  @Post(':brandId/verticals/:verticalCode/disable')
  disable(@Param('brandId') brandId: string, @Param('verticalCode') code: string) {
    return this.service.disableVerticalForBrand(brandId, code);
  }

  @Patch(':brandId/verticals/:verticalCode/overrides')
  updateOverrides(
    @Param('brandId') brandId: string,
    @Param('verticalCode') code: string,
    @Body() body: {
      disabled_modules?: string[];
      hidden_menus?: string[];
      disabled_features?: string[];
      custom_price?: number | null;
      custom_per_user_price?: number | null;
      custom_name?: string | null;
      custom_description?: string | null;
      custom_color?: string | null;
    },
  ) {
    return this.service.updateBrandVerticalOverrides(brandId, code, body);
  }

  @Get(':brandId/verticals/:verticalCode/effective')
  getEffective(@Param('brandId') brandId: string, @Param('verticalCode') code: string) {
    return this.service.getEffectiveConfig(brandId, code);
  }
}
