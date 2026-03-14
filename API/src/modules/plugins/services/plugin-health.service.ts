import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../tenant-config/services/encryption.service';
import { PluginHandlerRegistry, HealthCheckResult } from '../handlers/handler-registry';

@Injectable()
export class PluginHealthService {
  private readonly logger = new Logger(PluginHealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly handlerRegistry: PluginHandlerRegistry,
  ) {}

  /**
   * Test connection for a plugin using provided credentials (pre-install check).
   */
  async testWithCredentials(
    pluginCode: string,
    credentials: Record<string, any>,
  ): Promise<HealthCheckResult> {
    const handler = this.handlerRegistry.get(pluginCode);
    if (!handler) {
      return {
        success: false,
        message: `No handler registered for plugin "${pluginCode}". Connection test not available.`,
      };
    }

    try {
      return await handler.testConnection(credentials);
    } catch (error) {
      this.logger.error(`Health check failed for ${pluginCode}: ${error.message}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * Test connection for an already-installed plugin (uses stored encrypted credentials).
   */
  async testInstalled(tenantId: string, pluginCode: string): Promise<HealthCheckResult> {
    const plugin = await this.prisma.pluginRegistry.findUnique({
      where: { code: pluginCode },
    });
    if (!plugin) {
      throw new NotFoundException(`Plugin "${pluginCode}" not found`);
    }

    const tenantPlugin = await this.prisma.tenantPlugin.findUnique({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
    });

    if (!tenantPlugin) {
      throw new NotFoundException(`Plugin "${pluginCode}" not installed for this tenant`);
    }

    if (!tenantPlugin.credentials) {
      return { success: false, message: 'No credentials configured' };
    }

    const handler = this.handlerRegistry.get(pluginCode);
    if (!handler) {
      return {
        success: false,
        message: `No handler registered for plugin "${pluginCode}"`,
      };
    }

    try {
      const credentials = this.encryption.decrypt(tenantPlugin.credentials);
      const result = await handler.testConnection(credentials);

      // Update last verified timestamp
      await this.prisma.tenantPlugin.update({
        where: { id: tenantPlugin.id },
        data: {
          lastUsedAt: new Date(),
          ...(result.success
            ? { consecutiveErrors: 0, lastError: null }
            : { lastError: result.message, lastErrorAt: new Date() }),
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Health check failed for installed ${pluginCode}: ${error.message}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * Get health status summary for all installed plugins.
   */
  async getTenantPluginHealth(tenantId: string) {
    const tenantPlugins = await this.prisma.tenantPlugin.findMany({
      where: { tenantId },
      include: { plugin: true },
    });

    return tenantPlugins.map((tp) => ({
      pluginCode: tp.plugin.code,
      pluginName: tp.plugin.name,
      status: tp.status,
      isEnabled: tp.isEnabled,
      lastUsedAt: tp.lastUsedAt,
      lastErrorAt: tp.lastErrorAt,
      lastError: tp.lastError,
      errorCount: tp.errorCount,
      consecutiveErrors: tp.consecutiveErrors,
      hasHandler: this.handlerRegistry.has(tp.plugin.code),
    }));
  }
}
