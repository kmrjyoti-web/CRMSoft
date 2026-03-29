import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UpdateDefinitionDto } from './dto/shortcut.dto';

@Controller('keyboard-shortcuts/admin')
export class KeyboardShortcutsAdminController {
  constructor(private readonly service: KeyboardShortcutsService) {}

  /** GET / — all definitions with override counts */
  @Get()
  @RequirePermissions('settings:manage')
  async listAll(@CurrentUser() user: any) {
    const result = await this.service.adminListDefinitions(user.tenantId ?? '');
    return ApiResponse.success(result);
  }

  /** POST /seed — seed/re-seed default shortcuts */
  @Post('seed')
  @RequirePermissions('settings:manage')
  async seed(@CurrentUser() user: any) {
    const result = await this.service.seedDefaults(user.tenantId ?? '');
    return ApiResponse.success(result, `Seeded ${result.seeded} shortcuts`);
  }

  /** PUT /:id/lock — lock a shortcut */
  @Put(':id/lock')
  @RequirePermissions('settings:manage')
  async lock(@Param('id') id: string) {
    const result = await this.service.lockShortcut(id);
    return ApiResponse.success(result, 'Shortcut locked');
  }

  /** PUT /:id/unlock — unlock a shortcut */
  @Put(':id/unlock')
  @RequirePermissions('settings:manage')
  async unlock(@Param('id') id: string) {
    const result = await this.service.unlockShortcut(id);
    return ApiResponse.success(result, 'Shortcut unlocked');
  }

  /** PUT /:id — update definition */
  @Put(':id')
  @RequirePermissions('settings:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateDefinitionDto) {
    const result = await this.service.updateDefinition(id, dto);
    return ApiResponse.success(result, 'Shortcut updated');
  }
}
