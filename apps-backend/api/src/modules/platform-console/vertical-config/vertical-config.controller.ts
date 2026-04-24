import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { VerticalConfigService } from './vertical-config.service';

@Controller('platform-console/vertical-config')
export class VerticalConfigController {
  constructor(private readonly svc: VerticalConfigService) {}

  @Get()
  listAll() {
    return this.svc.listAll();
  }

  @Get(':code')
  getComplete(@Param('code') code: string) {
    return this.svc.getComplete(code);
  }

  @Get(':code/modules')
  getModules(@Param('code') code: string) {
    return this.svc.getModules(code);
  }

  @Get(':code/menus')
  getMenuTree(@Param('code') code: string) {
    return this.svc.getMenuTree(code);
  }

  @Get(':code/features')
  getFeatures(@Param('code') code: string) {
    return this.svc.getFeaturesGrouped(code);
  }

  @Get(':code/brand/:brandCode')
  getBrandConfig(@Param('code') code: string, @Param('brandCode') brandCode: string) {
    return this.svc.getBrandConfig(code, brandCode);
  }

  @Post(':code/brand/:brandCode')
  upsertBrandConfig(
    @Param('code') code: string,
    @Param('brandCode') brandCode: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.svc.upsertBrandConfig(code, brandCode, body);
  }
}
