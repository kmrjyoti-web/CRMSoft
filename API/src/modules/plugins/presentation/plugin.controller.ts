import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { PluginService } from '../services/plugin.service';
import { PluginHookService } from '../services/plugin-hook.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Controller('plugins')
@UseGuards(AuthGuard('jwt'))
export class PluginController {
  constructor(
    private readonly pluginService: PluginService,
    private readonly hookService: PluginHookService,
    private readonly prisma: PrismaService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // PLUGIN CATALOG (Available plugins)
  // ═══════════════════════════════════════════════════════

  @Get('catalog')
  async getCatalog(@Query('category') category?: string) {
    if (category) {
      return this.pluginService.getPluginsByCategory(category as any);
    }
    return this.pluginService.getAllPlugins();
  }

  @Get('catalog/:code')
  async getPluginDetails(@Param('code') code: string) {
    return this.pluginService.getPluginByCode(code);
  }

  // ═══════════════════════════════════════════════════════
  // TENANT PLUGINS (Installed plugins)
  // ═══════════════════════════════════════════════════════

  @Get('installed')
  @RequirePermissions('plugins:view')
  async getInstalledPlugins(@CurrentUser('tenantId') tenantId: string) {
    return this.pluginService.getTenantPlugins(tenantId);
  }

  @Get('installed/:code')
  @RequirePermissions('plugins:view')
  async getInstalledPlugin(
    @CurrentUser('tenantId') tenantId: string,
    @Param('code') code: string,
  ) {
    const plugin = await this.pluginService.getTenantPlugin(tenantId, code);
    if (plugin) {
      return {
        ...plugin,
        credentials: undefined,
        hasCredentials: !!plugin.credentials,
      };
    }
    return null;
  }

  @Post('install/:code')
  @RequirePermissions('plugins:manage')
  async installPlugin(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('code') code: string,
    @Body() body: {
      credentials: Record<string, any>;
      settings?: Record<string, any>;
    },
  ) {
    return this.pluginService.enablePlugin(
      tenantId,
      code,
      body.credentials,
      body.settings,
      userId,
    );
  }

  @Put(':code/credentials')
  @RequirePermissions('plugins:manage')
  async updateCredentials(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('code') code: string,
    @Body() body: { credentials: Record<string, any> },
  ) {
    return this.pluginService.updateCredentials(
      tenantId,
      code,
      body.credentials,
      userId,
    );
  }

  @Put(':code/settings')
  @RequirePermissions('plugins:manage')
  async updateSettings(
    @CurrentUser('tenantId') tenantId: string,
    @Param('code') code: string,
    @Body() body: { settings: Record<string, any> },
  ) {
    const plugin = await this.pluginService.getPluginByCode(code);
    await this.prisma.platform.tenantPlugin.update({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
      data: { settings: body.settings },
    });
    return { success: true };
  }

  @Post(':code/enable')
  @RequirePermissions('plugins:manage')
  async enablePlugin(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('code') code: string,
  ) {
    const existing = await this.pluginService.getTenantPlugin(tenantId, code);
    if (!existing?.credentials) {
      throw new BadRequestException('Plugin credentials not configured. Install the plugin first.');
    }
    // Re-enable with existing credentials
    const plugin = await this.pluginService.getPluginByCode(code);
    await this.prisma.platform.tenantPlugin.update({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
      data: {
        isEnabled: true,
        status: 'TP_ACTIVE',
        enabledAt: new Date(),
        disabledAt: null,
        errorCount: 0,
        consecutiveErrors: 0,
        lastError: null,
        updatedById: userId,
      },
    });
    return { success: true, code };
  }

  @Post(':code/disable')
  @RequirePermissions('plugins:manage')
  async disablePlugin(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('code') code: string,
  ) {
    return this.pluginService.disablePlugin(tenantId, code, userId);
  }

  // ═══════════════════════════════════════════════════════
  // PLUGIN LOGS
  // ═══════════════════════════════════════════════════════

  @Get(':code/logs')
  @RequirePermissions('plugins:view')
  async getPluginLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Param('code') code: string,
    @Query('limit') limit = '100',
    @Query('hookPoint') hookPoint?: string,
    @Query('status') status?: string,
  ) {
    const plugin = await this.pluginService.getPluginByCode(code);
    return this.hookService.getHookLogs(tenantId, {
      pluginId: plugin.id,
      hookPoint,
      status,
      limit: parseInt(limit),
    });
  }

  @Get('check/:code')
  async checkPluginStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('code') code: string,
  ) {
    const enabled = await this.pluginService.isPluginEnabled(tenantId, code);
    return { code, enabled };
  }
}
