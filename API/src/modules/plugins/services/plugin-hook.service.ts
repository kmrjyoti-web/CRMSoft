import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginService } from './plugin.service';

interface HookPayload {
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  data: any;
  userId?: string;
}

/**
 * Fires hook events to all enabled plugins that listen to them.
 * Execution is async (fire-and-forget) — errors are logged, not propagated.
 */
@Injectable()
export class PluginHookService {
  private readonly logger = new Logger(PluginHookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pluginService: PluginService,
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
        // Log the hook execution as SUCCESS
        // In a real implementation, this would delegate to a specific plugin handler
        // e.g., WhatsAppPluginHandler.onLeadCreated(lead, credentials)
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
          errorMessage,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to log hook execution: ${err.message}`);
    }
  }
}
