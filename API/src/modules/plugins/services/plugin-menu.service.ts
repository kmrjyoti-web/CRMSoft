import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

/**
 * Auto-enable/disable menu items when plugins are installed/uninstalled.
 * Uses PluginRegistry.menuCodes to find matching Menu records.
 */
@Injectable()
export class PluginMenuService {
  private readonly logger = new Logger(PluginMenuService.name);

  /**
   * Enable menu items associated with a plugin for a tenant.
   * Called when a plugin is installed/enabled.
   */
  async enableMenusForPlugin(
    tenantId: string,
    pluginCode: string,
  ): Promise<{ enabled: string[] }> {
    const menuCodes = await this.getPluginMenuCodes(pluginCode);
    if (menuCodes.length === 0) return { enabled: [] };

    const enabled: string[] = [];

    for (const code of menuCodes) {
      try {
        const result = await this.prisma.menu.updateMany({
          where: { tenantId, code, isActive: false },
          data: { isActive: true },
        });
        if (result.count > 0) {
          enabled.push(code);
        }
      } catch {
        // Menu may not exist for this tenant — skip
        this.logger.debug(`Menu code "${code}" not found for tenant ${tenantId}`);
      }
    }

    if (enabled.length > 0) {
      this.logger.log(
        `Enabled ${enabled.length} menu(s) for plugin "${pluginCode}" in tenant ${tenantId}: ${enabled.join(', ')}`,
      );
    }

    return { enabled };
  }

  /**
   * Disable menu items associated with a plugin for a tenant.
   * Called when a plugin is disabled/uninstalled.
   */
  async disableMenusForPlugin(
    tenantId: string,
    pluginCode: string,
  ): Promise<{ disabled: string[] }> {
    const menuCodes = await this.getPluginMenuCodes(pluginCode);
    if (menuCodes.length === 0) return { disabled: [] };

    const disabled: string[] = [];

    for (const code of menuCodes) {
      try {
        const result = await this.prisma.menu.updateMany({
          where: { tenantId, code, isActive: true },
          data: { isActive: false },
        });
        if (result.count > 0) {
          disabled.push(code);
        }
      } catch {
        this.logger.debug(`Menu code "${code}" not found for tenant ${tenantId}`);
      }
    }

    if (disabled.length > 0) {
      this.logger.log(
        `Disabled ${disabled.length} menu(s) for plugin "${pluginCode}" in tenant ${tenantId}: ${disabled.join(', ')}`,
      );
    }

    return { disabled };
  }

  /**
   * Get all menu codes for a plugin from the registry.
   */
  private async getPluginMenuCodes(pluginCode: string): Promise<string[]> {
    const plugin = await this.prisma.pluginRegistry.findUnique({
      where: { code: pluginCode },
      select: { menuCodes: true },
    });
    return plugin?.menuCodes ?? [];
  }

  constructor(private readonly prisma: PrismaService) {}
}
