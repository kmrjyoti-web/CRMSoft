import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginService } from './plugin.service';
import { PluginHandlerRegistry, HookPayload } from '../handlers/handler-registry';
import { EncryptionService } from '../../tenant-config/services/encryption.service';
import { getErrorMessage } from '@/common/utils/error.utils';

export { HookPayload };

/**
 * Fires hook events to all enabled plugins that listen to them.
 * Delegates to registered plugin handlers for actual execution.
 * Execution is async (fire-and-forget) — errors are logged, not propagated.
 */
@Injectable()
export class PluginHookService {
  private readonly logger = new Logger(PluginHookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pluginService: PluginService,
    private readonly handlerRegistry: PluginHandlerRegistry,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * Fire a hook event to all enabled plugins that listen to it.
   * Each plugin handler runs independently — one failure doesn't block others.
   */
  async fireHook(hookPoint: string, payload: HookPayload): Promise<void> {
    const { tenantId, entityType, entityId, data } = payload;

    this.logger.debug(`Firing hook: ${hookPoint} for tenant ${tenantId}`);

    // Find all enabled plugins with this hook point
    const tenantPlugins = await this.prisma.tenantPlugin.findMany({
      where: {
        tenantId,
        isEnabled: true,
        status: 'TP_ACTIVE',
        plugin: {
          hookPoints: { has: hookPoint },
          status: 'PLUGIN_ACTIVE',
        },
      },
      include: { plugin: true },
    });

    if (tenantPlugins.length === 0) return;

    // Execute each plugin handler independently
    for (const tenantPlugin of tenantPlugins) {
      const startTime = Date.now();

      try {
        // Delegate to registered handler if available
        let responsePayload: any = null;
        const handler = this.handlerRegistry.get(tenantPlugin.plugin.code);

        if (handler) {
          // Decrypt credentials for the handler
          let credentials: Record<string, any> = {};
          if (tenantPlugin.credentials) {
            try {
              credentials = this.encryption.decrypt(tenantPlugin.credentials);
            } catch {
              this.logger.error(`Failed to decrypt credentials for ${tenantPlugin.plugin.code}`);
            }
          }

          responsePayload = await handler.handle(
            hookPoint,
            payload,
            credentials,
            (tenantPlugin.settings as Record<string, any>) || {},
          );
        } else {
          this.logger.debug(`No handler for plugin ${tenantPlugin.plugin.code}, logging only`);
        }

        await this.logHookExecution(
          tenantId,
          tenantPlugin.pluginId,
          hookPoint,
          entityType,
          entityId,
          'SUCCESS',
          Date.now() - startTime,
          data,
          null,
          responsePayload,
        );

        // Clear consecutive errors on success
        await this.pluginService.clearErrors(tenantId, tenantPlugin.plugin.code);

        // Record usage
        await this.pluginService.recordUsage(tenantId, tenantPlugin.plugin.code);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        await this.logHookExecution(
          tenantId,
          tenantPlugin.pluginId,
          hookPoint,
          entityType,
          entityId,
          'FAILED',
          Date.now() - startTime,
          data,
          errorMessage,
        );

        await this.pluginService.recordError(
          tenantId,
          tenantPlugin.plugin.code,
          errorMessage,
        );

        this.logger.error(
          `Hook ${hookPoint} failed for plugin ${tenantPlugin.plugin.code}: ${errorMessage}`,
        );
      }
    }
  }

  /**
   * Get plugins that listen to a specific hook.
   */
  async getPluginsForHook(tenantId: string, hookPoint: string) {
    return this.prisma.tenantPlugin.findMany({
      where: {
        tenantId,
        isEnabled: true,
        status: 'TP_ACTIVE',
        plugin: { hookPoints: { has: hookPoint } },
      },
      include: { plugin: true },
    });
  }

  /**
   * Get hook execution logs with filtering.
   */
  async getHookLogs(
    tenantId: string,
    filters?: {
      pluginId?: string;
      hookPoint?: string;
      status?: string;
      limit?: number;
    },
  ) {
    return this.prisma.pluginHookLog.findMany({
      where: {
        tenantId,
        ...(filters?.pluginId && { pluginId: filters.pluginId }),
        ...(filters?.hookPoint && { hookPoint: filters.hookPoint }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { executedAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  private async logHookExecution(
    tenantId: string,
    pluginId: string,
    hookPoint: string,
    entityType: string | null,
    entityId: string | null,
    status: string,
    durationMs: number,
    requestPayload: any,
    errorMessage: string | null,
    responsePayload?: any,
  ) {
    try {
      await this.prisma.pluginHookLog.create({
        data: {
          tenantId,
          pluginId,
          hookPoint,
          entityType,
          entityId,
          status,
          durationMs,
          requestPayload: requestPayload
            ? JSON.parse(JSON.stringify(requestPayload))
            : undefined,
          responsePayload: responsePayload
            ? JSON.parse(JSON.stringify(responsePayload))
            : undefined,
          errorMessage,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to log hook execution: ${getErrorMessage(err)}`);
    }
  }
}
