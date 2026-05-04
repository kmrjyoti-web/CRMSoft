import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';
import { PluginCategory } from '@prisma/platform-client';
import { PluginMenuService } from './plugin-menu.service';
import { industryFilter } from '../../../common/utils/industry-filter.util';
import { getErrorMessage } from '@/common/utils/error.utils';

interface PluginCredentials {
  [key: string]: string | number | boolean;
}

@Injectable()
export class PluginService {
  private readonly logger = new Logger(PluginService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    @Inject(forwardRef(() => PluginMenuService))
    private readonly menuService: PluginMenuService,
  ) {}

  // -------------------------------------------------------
  // PLUGIN REGISTRY (Read-only for tenants)
  // -------------------------------------------------------

  async getAllPlugins(industryCode?: string) {
    return this.prisma.platform.pluginRegistry.findMany({
      where: { status: 'PLUGIN_ACTIVE', ...industryFilter(industryCode) } as any,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getPluginsByCategory(category: PluginCategory, industryCode?: string) {
    return this.prisma.platform.pluginRegistry.findMany({
      where: { category, status: 'PLUGIN_ACTIVE', ...industryFilter(industryCode) } as any,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPluginByCode(code: string) {
    const plugin = await this.prisma.platform.pluginRegistry.findUnique({
      where: { code },
    });
    if (!plugin) {
      throw new NotFoundException(`Plugin "${code}" not found`);
    }
    return plugin;
  }

  // -------------------------------------------------------
  // TENANT PLUGINS
  // -------------------------------------------------------

  async getTenantPlugins(tenantId: string) {
    return this.prisma.platform.tenantPlugin.findMany({
      where: { tenantId },
      include: { plugin: true },
      orderBy: { plugin: { category: 'asc' } },
    });
  }

  async getTenantPlugin(tenantId: string, pluginCode: string) {
    const plugin = await this.getPluginByCode(pluginCode);
    return this.prisma.platform.tenantPlugin.findUnique({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
      include: { plugin: true },
    });
  }

  async getEnabledPlugins(tenantId: string) {
    return this.prisma.platform.tenantPlugin.findMany({
      where: { tenantId, isEnabled: true, status: 'TP_ACTIVE' },
      include: { plugin: true },
    });
  }

  /**
   * Enable a plugin for a tenant (creates/updates TenantPlugin record).
   */
  async enablePlugin(
    tenantId: string,
    pluginCode: string,
    credentials: PluginCredentials,
    settings?: Record<string, any>,
    userId?: string,
  ) {
    const plugin = await this.getPluginByCode(pluginCode);

    // Validate credentials against schema
    this.validateCredentials(credentials, plugin.configSchema as any);

    // Encrypt credentials
    const encryptedCredentials = this.encryption.encrypt(credentials);

    // Generate webhook URL if needed
    const webhookUrl = plugin.webhookConfig
      ? this.generateWebhookUrl(pluginCode, tenantId)
      : null;

    const tenantPlugin = await this.prisma.platform.tenantPlugin.upsert({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
      update: {
        credentials: encryptedCredentials,
        settings: settings || {},
        isEnabled: true,
        status: 'TP_ACTIVE',
        enabledAt: new Date(),
        disabledAt: null,
        errorCount: 0,
        consecutiveErrors: 0,
        lastError: null,
        webhookUrl,
        updatedById: userId,
      },
      create: {
        tenantId,
        pluginId: plugin.id,
        credentials: encryptedCredentials,
        settings: settings || {},
        isEnabled: true,
        status: 'TP_ACTIVE',
        enabledAt: new Date(),
        webhookUrl,
        createdById: userId,
      },
      include: { plugin: true },
    });

    this.logger.log(`Plugin "${pluginCode}" enabled for tenant ${tenantId}`);

    // Auto-enable associated menus
    try {
      await this.menuService.enableMenusForPlugin(tenantId, pluginCode);
    } catch (err) {
      this.logger.warn(`Failed to auto-enable menus for plugin "${pluginCode}": ${getErrorMessage(err)}`);
    }

    return {
      ...tenantPlugin,
      credentials: undefined, // Never return encrypted credentials
      webhookUrl,
    };
  }

  /**
   * Disable a plugin for a tenant.
   */
  async disablePlugin(tenantId: string, pluginCode: string, userId?: string) {
    const plugin = await this.getPluginByCode(pluginCode);

    const tenantPlugin = await this.prisma.platform.tenantPlugin.update({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
      data: {
        isEnabled: false,
        status: 'TP_INACTIVE',
        disabledAt: new Date(),
        updatedById: userId,
      },
    });

    this.logger.log(`Plugin "${pluginCode}" disabled for tenant ${tenantId}`);

    // Auto-disable associated menus
    try {
      await this.menuService.disableMenusForPlugin(tenantId, pluginCode);
    } catch (err) {
      this.logger.warn(`Failed to auto-disable menus for plugin "${pluginCode}": ${getErrorMessage(err)}`);
    }

    return tenantPlugin;
  }

  /**
   * Update plugin credentials.
   */
  async updateCredentials(
    tenantId: string,
    pluginCode: string,
    credentials: PluginCredentials,
    userId?: string,
  ) {
    const plugin = await this.getPluginByCode(pluginCode);
    this.validateCredentials(credentials, plugin.configSchema as any);

    const encryptedCredentials = this.encryption.encrypt(credentials);

    await this.prisma.platform.tenantPlugin.update({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
      data: {
        credentials: encryptedCredentials,
        errorCount: 0,
        consecutiveErrors: 0,
        lastError: null,
        updatedById: userId,
      },
    });

    return { success: true };
  }

  /**
