import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class TableConfigService {
  private readonly logger = new Logger(TableConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get merged config for a user: user-specific → tenant default → null.
   */
  async getConfig(tableKey: string, userId: string, tenantId: string) {
    // 1. Try user-specific config
    const userConfig = await this.prisma.tableConfig.findFirst({
      where: { tenantId, tableKey, userId },
    });
    if (userConfig) return userConfig;

    // 2. Fall back to tenant-wide default
    const tenantDefault = await this.prisma.tableConfig.findFirst({
      where: { tenantId, tableKey, userId: null, isDefault: true },
    });
    return tenantDefault;
  }

  /**
   * Upsert user's config for a specific table.
   */
  async upsertUserConfig(
    tableKey: string,
    userId: string,
    tenantId: string,
    config: Record<string, any>,
  ) {
    return this.prisma.tableConfig.upsert({
      where: {
        tenantId_tableKey_userId: { tenantId, tableKey, userId },
      },
      update: { config },
      create: {
        tenantId,
        tableKey,
        userId,
        config,
        isDefault: false,
      },
    });
  }

  /**
   * Upsert tenant-wide default config (admin only).
   */
  async upsertTenantDefault(
    tableKey: string,
    tenantId: string,
    config: Record<string, any>,
  ) {
    // Use a special composite key with null userId
    const existing = await this.prisma.tableConfig.findFirst({
      where: { tenantId, tableKey, userId: null, isDefault: true },
    });

    if (existing) {
      return this.prisma.tableConfig.update({
        where: { id: existing.id },
        data: { config },
      });
    }

    return this.prisma.tableConfig.create({
      data: {
        tenantId,
        tableKey,
        userId: null,
        config,
        isDefault: true,
      },
    });
  }

  /**
   * Delete user's config (reset to default).
   */
  async deleteUserConfig(tableKey: string, userId: string, tenantId: string) {
    const existing = await this.prisma.tableConfig.findFirst({
      where: { tenantId, tableKey, userId },
    });
    if (!existing) return { deleted: false };

    await this.prisma.tableConfig.delete({ where: { id: existing.id } });
    return { deleted: true };
  }
}
