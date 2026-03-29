import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigCategory } from '@prisma/identity-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConfigSeederService } from './config-seeder.service';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

@Injectable()
export class TenantConfigService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly seeder: ConfigSeederService,
  ) {}

  async get(tenantId: string, key: string): Promise<string | null> {
    const cacheKey = `${tenantId}:${key}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const config = await this.prisma.tenantConfig.findFirst({
      where: { tenantId, configKey: key },
    });

    if (!config) return null;

    const value = config.configValue ?? config.defaultValue ?? null;
    if (value !== null) {
      this.cache.set(cacheKey, { value, expiresAt: Date.now() + this.CACHE_TTL });
    }
    return value;
  }

  async getInt(tenantId: string, key: string): Promise<number | null> {
    const val = await this.get(tenantId, key);
    return val !== null ? parseInt(val, 10) : null;
  }

  async getDecimal(tenantId: string, key: string): Promise<number | null> {
    const val = await this.get(tenantId, key);
    return val !== null ? parseFloat(val) : null;
  }

  async getBool(tenantId: string, key: string): Promise<boolean | null> {
    const val = await this.get(tenantId, key);
    return val !== null ? val === 'true' : null;
  }

  async getJson(tenantId: string, key: string): Promise<any | null> {
    const val = await this.get(tenantId, key);
    if (val === null) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }

  async getByCategory(tenantId: string, category: ConfigCategory) {
    const configs = await this.prisma.tenantConfig.findMany({
      where: { tenantId, category, isVisible: true },
      orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }],
    });

    const grouped: Record<string, any[]> = {};
    for (const cfg of configs) {
      const group = cfg.groupName || 'General';
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push({
        key: cfg.configKey,
        value: cfg.configValue,
        defaultValue: cfg.defaultValue,
        displayName: cfg.displayName,
        description: cfg.description,
        valueType: cfg.valueType,
        isRequired: cfg.isRequired,
        isReadOnly: cfg.isReadOnly,
        enumOptions: cfg.enumOptions,
        minValue: cfg.minValue,
        maxValue: cfg.maxValue,
      });
    }
    return grouped;
  }

  async getAll(tenantId: string) {
    const configs = await this.prisma.tenantConfig.findMany({
      where: { tenantId, isVisible: true },
      orderBy: [{ category: 'asc' }, { groupName: 'asc' }, { sortOrder: 'asc' }],
    });

    const byCategory: Record<string, any[]> = {};
    for (const cfg of configs) {
      if (!byCategory[cfg.category]) byCategory[cfg.category] = [];
      byCategory[cfg.category].push({
        key: cfg.configKey,
        value: cfg.configValue,
        defaultValue: cfg.defaultValue,
        displayName: cfg.displayName,
        description: cfg.description,
        valueType: cfg.valueType,
        isRequired: cfg.isRequired,
        isReadOnly: cfg.isReadOnly,
        groupName: cfg.groupName,
        enumOptions: cfg.enumOptions,
      });
    }
    return byCategory;
  }

  async set(
    tenantId: string,
    key: string,
    value: string,
    userId: string,
    userName?: string,
  ): Promise<void> {
    const config = await this.prisma.tenantConfig.findFirst({
      where: { tenantId, configKey: key },
    });

    if (!config) {
      throw new BadRequestException(`Config key '${key}' not found`);
    }

    if (config.isReadOnly) {
      throw new BadRequestException(`Config '${key}' is read-only`);
    }

    // Validate by type
    this.validateValue(config, value);

    await this.prisma.tenantConfig.update({
      where: { id: config.id },
      data: {
        configValue: value,
        updatedById: userId,
        updatedByName: userName,
      },
    });

    // Invalidate cache
    this.cache.delete(`${tenantId}:${key}`);
  }

  async bulkSet(
    tenantId: string,
    configs: { key: string; value: string }[],
    userId: string,
    userName?: string,
  ): Promise<{ updated: number }> {
    let updated = 0;
    for (const { key, value } of configs) {
      await this.set(tenantId, key, value, userId, userName);
      updated++;
    }
    return { updated };
  }

  async resetToDefault(tenantId: string, key: string, userId: string): Promise<void> {
    const config = await this.prisma.tenantConfig.findFirst({
      where: { tenantId, configKey: key },
    });

    if (!config) {
      throw new BadRequestException(`Config key '${key}' not found`);
    }

    await this.prisma.tenantConfig.update({
      where: { id: config.id },
      data: {
        configValue: config.defaultValue || '',
        updatedById: userId,
      },
    });

    this.cache.delete(`${tenantId}:${key}`);
  }

  async seedDefaults(tenantId: string): Promise<{ seeded: number }> {
    return this.seeder.seedDefaults(tenantId);
  }

  private validateValue(config: any, value: string): void {
    switch (config.valueType) {
      case 'INTEGER': {
        const num = parseInt(value, 10);
        if (isNaN(num)) throw new BadRequestException(`'${config.configKey}' must be an integer`);
        if (config.minValue !== null && num < Number(config.minValue)) {
          throw new BadRequestException(`'${config.configKey}' minimum is ${config.minValue}`);
        }
        if (config.maxValue !== null && num > Number(config.maxValue)) {
          throw new BadRequestException(`'${config.configKey}' maximum is ${config.maxValue}`);
        }
        break;
      }
      case 'DECIMAL': {
        const dec = parseFloat(value);
        if (isNaN(dec)) throw new BadRequestException(`'${config.configKey}' must be a number`);
        break;
      }
      case 'BOOLEAN':
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(`'${config.configKey}' must be 'true' or 'false'`);
        }
        break;
      case 'JSON':
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`'${config.configKey}' must be valid JSON`);
        }
        break;
      case 'ENUM': {
        const options = config.enumOptions as string[] | null;
        if (options && !options.includes(value)) {
          throw new BadRequestException(`'${config.configKey}' must be one of: ${options.join(', ')}`);
        }
        break;
      }
    }

    // Regex validation
    if (config.validationRule) {
      const regex = new RegExp(config.validationRule);
      if (!regex.test(value)) {
        throw new BadRequestException(`'${config.configKey}' does not match the required format`);
      }
    }
  }
}
