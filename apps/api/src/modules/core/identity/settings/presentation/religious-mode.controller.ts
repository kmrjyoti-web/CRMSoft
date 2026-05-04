import { Controller, Get, Patch, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReligiousModeService } from '../services/religious-mode.service';
import { ReligiousModeConfig } from '../data/religious-presets';

@ApiTags('Settings - Religious Mode')
@Controller('settings/religious-mode')
export class ReligiousModeController {
  constructor(private readonly service: ReligiousModeService) {}

  /** GET /settings/religious-mode — full config for settings page */
  @Get()
  async getConfig(@Req() req: any) {
    return this.service.getConfig(req.user.tenantId);
  }

  /** PATCH /settings/religious-mode — update config */
  @Patch()
  async updateConfig(@Req() req: any, @Body() body: Partial<ReligiousModeConfig>) {
    return this.service.updateConfig(req.user.tenantId, body);
  }

  /** GET /settings/religious-mode/status — called on every app load */
  @Get('status')
  async getStatus(@Req() req: any) {
    return this.service.getStatus(
      req.user.tenantId,
      req.user.id,
      req.user.roleId,
      req.user.role,
    );
  }

  /** GET /settings/religious-mode/presets — all religion/deity presets */
  @Get('presets')
  getPresets() {
    return this.service.getPresets();
  }

  /** POST /settings/religious-mode/log — record puja interaction */
  @Post('log')
  async logInteraction(
    @Req() req: any,
    @Body() body: { itemsOffered: string[]; duration: number; date: string },
  ) {
    await this.service.logInteraction(
      req.user.tenantId,
      req.user.id,
      body.itemsOffered ?? [],
      body.duration ?? 0,
      body.date ?? new Date().toISOString().split('T')[0],
    );
    return { logged: true };
  }

  /** GET /settings/religious-mode/analytics — team engagement stats */
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.service.getAnalytics(req.user.tenantId);
  }
}
