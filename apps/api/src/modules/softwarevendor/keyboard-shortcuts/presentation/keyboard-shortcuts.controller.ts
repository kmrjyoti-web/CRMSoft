import {
  Controller, Get, Put, Delete, Post, Param, Body,
} from '@nestjs/common';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UpsertOverrideDto, CreateCustomShortcutDto, CheckConflictDto } from './dto/shortcut.dto';

@Controller('keyboard-shortcuts')
export class KeyboardShortcutsController {
  constructor(private readonly service: KeyboardShortcutsService) {}

  /** GET / — all shortcuts merged with user overrides */
  @Get()
  async getAll(@CurrentUser() user: any) {
    const result = await this.service.getAllForUser(user.id, user.tenantId ?? '');
    return ApiResponse.success(result);
  }

  /** PUT /:shortcutId/override — set user key override */
  @Put(':shortcutId/override')
  async upsertOverride(
    @CurrentUser() user: any,
    @Param('shortcutId') shortcutId: string,
    @Body() dto: UpsertOverrideDto,
  ) {
    const result = await this.service.upsertOverride(user.id, user.tenantId ?? '', shortcutId, dto);
    return ApiResponse.success(result, 'Shortcut updated');
  }

  /** DELETE /:shortcutId/override — reset single shortcut to default */
  @Delete(':shortcutId/override')
  async removeOverride(@CurrentUser() user: any, @Param('shortcutId') shortcutId: string) {
    const result = await this.service.removeOverride(user.id, user.tenantId ?? '', shortcutId);
    return ApiResponse.success(result, 'Shortcut reset to default');
  }

  /** DELETE /overrides/all — reset ALL shortcuts to defaults */
  @Delete('overrides/all')
  async resetAll(@CurrentUser() user: any) {
    const result = await this.service.resetAllOverrides(user.id, user.tenantId ?? '');
    return ApiResponse.success(result, 'All shortcuts reset to defaults');
  }

  /** POST /custom — create a new custom shortcut */
  @Post('custom')
  async createCustom(@CurrentUser() user: any, @Body() dto: CreateCustomShortcutDto) {
    const result = await this.service.createCustom(user.id, user.tenantId ?? '', dto);
    return ApiResponse.success(result, 'Custom shortcut created');
  }

  /** POST /check-conflict — check if a key is available */
  @Post('check-conflict')
  async checkConflict(@CurrentUser() user: any, @Body() dto: CheckConflictDto) {
    const result = await this.service.checkConflict(user.id, user.tenantId ?? '', dto.key, dto.excludeShortcutId);
    return ApiResponse.success(result);
  }
}
