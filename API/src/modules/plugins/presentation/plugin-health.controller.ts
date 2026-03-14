import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { PluginHealthService } from '../services/plugin-health.service';

@Controller('plugins/health')
@UseGuards(AuthGuard('jwt'))
export class PluginHealthController {
  constructor(private readonly healthService: PluginHealthService) {}

  /**
   * Test connection for an already-installed plugin.
   * Uses stored encrypted credentials.
   */
  @Post(':code/test')
  @RequirePermissions('plugins:manage')
  async testInstalledPlugin(
    @CurrentUser('tenantId') tenantId: string,
    @Param('code') code: string,
  ) {
    return this.healthService.testInstalled(tenantId, code);
  }

  /**
   * Test connection with provided credentials (pre-install check).
   * Credentials are NOT stored — just tested and discarded.
   */
  @Post(':code/test-credentials')
  @RequirePermissions('plugins:manage')
  async testWithCredentials(
    @Param('code') code: string,
    @Body() body: { credentials: Record<string, any> },
  ) {
    return this.healthService.testWithCredentials(code, body.credentials);
  }

  /**
   * Get health status summary for all installed plugins.
   */
  @Get('summary')
  @RequirePermissions('plugins:view')
  async getHealthSummary(@CurrentUser('tenantId') tenantId: string) {
    return this.healthService.getTenantPluginHealth(tenantId);
  }
}
