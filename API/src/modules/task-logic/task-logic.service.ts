import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class TaskLogicService {
  private readonly logger = new Logger(TaskLogicService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get a config value by key (returns parsed JSON value). */
  async getConfig<T = any>(key: string, tenantId = ''): Promise<T | null> {
    const config = await this.prisma.taskLogicConfig.findUnique({
      where: { tenantId_configKey: { tenantId, configKey: key } },
    });
    if (!config || !config.isActive) return null;
    return config.value as T;
  }

  /** Get all active configs. */
  async getAllConfigs(tenantId = '') {
    return this.prisma.taskLogicConfig.findMany({
      where: { tenantId, isActive: true },
      orderBy: { configKey: 'asc' },
    });
  }

  /** Upsert a config value. */
  async upsertConfig(key: string, value: any, description?: string, tenantId = '') {
    return this.prisma.taskLogicConfig.upsert({
      where: { tenantId_configKey: { tenantId, configKey: key } },
      update: { value, description, updatedAt: new Date() },
      create: { tenantId, configKey: key, value, description },
    });
  }

  /** Delete (soft) a config. */
  async deleteConfig(key: string, tenantId = '') {
    return this.prisma.taskLogicConfig.update({
      where: { tenantId_configKey: { tenantId, configKey: key } },
      data: { isActive: false },
    });
  }
}
