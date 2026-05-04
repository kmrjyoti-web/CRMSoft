import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { WhitelistModuleDto } from './dto/whitelist-module.dto';
import { SetFeatureFlagDto } from './dto/set-feature-flag.dto';
import { BRAND_MANAGER_ERRORS } from './brand-manager.errors';

const FEATURE_CODES = [
  'MARKETPLACE',
  'AI_WORKFLOWS',
  'WHATSAPP_CHAT',
  'CUSTOM_DOMAIN',
  'MULTI_LANGUAGE',
  'REPORTS_DESIGNER',
  'WORKFLOW_BUILDER',
  'PUJA_MODE',
  'BULK_IMPORT',
  'API_ACCESS',
  'WEBHOOK_INTEGRATIONS',
  'ADVANCED_ANALYTICS',
];

@Injectable()
export class BrandManagerService {
  private readonly logger = new Logger(BrandManagerService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async getBrands() {
    try {
      const whitelistRecords = await this.db.brandModuleWhitelist.findMany();
      const brandIds = [...new Set(whitelistRecords.map((r) => r.brandId))];

      const results = await Promise.all(
        brandIds.map(async (brandId) => {
          const modulesCount = await this.db.brandModuleWhitelist.count({ where: { brandId } });
          const featuresCount = await this.db.brandFeatureFlag.count({
            where: { brandId, isEnabled: true },
          });
          const latestError = await this.db.brandErrorSummary.findFirst({
            where: { brandId },
            orderBy: { period: 'desc' },
          });

          return {
            brandId,
            modulesCount,
            featuresCount,
            totalErrors: latestError?.totalErrors ?? 0,
            criticalCount: latestError?.criticalCount ?? 0,
          };
        }),
      );

      return results;
    } catch (error) {
      this.logger.error('Failed to get brands', (error as Error).stack);
      throw error;
    }
  }

  async getBrandDetail(brandId: string) {
    try {
      const modules = await this.db.brandModuleWhitelist.findMany({
        where: { brandId },
      });
      const features = await this.db.brandFeatureFlag.findMany({
        where: { brandId },
      });
      const errorSummary = await this.db.brandErrorSummary.findMany({
        where: { brandId },
        orderBy: { period: 'desc' },
        take: 12,
      });
      const recentErrors = await this.db.globalErrorLog.findMany({
        where: { brandId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return { brandId, modules, features, errorSummary, recentErrors };
    } catch (error) {
      this.logger.error(`Failed to get brand detail: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async getModules(brandId: string) {
    try {
      return await this.db.brandModuleWhitelist.findMany({
        where: { brandId },
        orderBy: { enabledAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to get modules for brand: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async whitelistModule(brandId: string, dto: WhitelistModuleDto) {
    try {
      const existing = await this.db.brandModuleWhitelist.findUnique({
        where: { brandId_moduleCode: { brandId, moduleCode: dto.moduleCode } },
      });
      if (existing) {
        const err = BRAND_MANAGER_ERRORS.MODULE_ALREADY_WHITELISTED;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return await this.db.brandModuleWhitelist.create({
        data: {
          brandId,
          moduleCode: dto.moduleCode,
          status: dto.status || 'ENABLED',
          trialExpiresAt: dto.trialExpiresAt ? new Date(dto.trialExpiresAt) : null,
          enabledAt: new Date(),
          enabledBy: dto.enabledBy || null,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to whitelist module for brand: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async updateModule(id: string, data: { status?: string; trialExpiresAt?: string }) {
    try {
      return await this.db.brandModuleWhitelist.update({
        where: { id },
        data: {
          ...(data.status !== undefined && { status: data.status }),
          ...(data.trialExpiresAt !== undefined && { trialExpiresAt: new Date(data.trialExpiresAt) }),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update module: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async removeModule(id: string) {
    try {
      return await this.db.brandModuleWhitelist.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to remove module: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async getFeatures(brandId: string) {
    try {
      const flags = await this.db.brandFeatureFlag.findMany({
        where: { brandId },
      });
      return { flags, allFeatureCodes: FEATURE_CODES };
    } catch (error) {
      this.logger.error(`Failed to get features for brand: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async setFeatureFlag(brandId: string, dto: SetFeatureFlagDto) {
    try {
      if (!FEATURE_CODES.includes(dto.featureCode)) {
        const err = BRAND_MANAGER_ERRORS.INVALID_FEATURE_CODE;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return await this.db.brandFeatureFlag.upsert({
        where: { brandId_featureCode: { brandId, featureCode: dto.featureCode } },
        update: {
          isEnabled: dto.isEnabled,
          config: (dto.config ?? {}) as any,
          updatedAt: new Date(),
        },
        create: {
          brandId,
          featureCode: dto.featureCode,
          isEnabled: dto.isEnabled,
          config: (dto.config ?? {}) as any,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to set feature flag for brand: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async updateFeatureFlag(id: string, data: { isEnabled?: boolean; config?: Record<string, unknown> }) {
    try {
      return await this.db.brandFeatureFlag.update({
        where: { id },
        data: {
          ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
          ...(data.config !== undefined && { config: data.config as any }),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update feature flag: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async removeFeatureFlag(id: string) {
    try {
      return await this.db.brandFeatureFlag.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to remove feature flag: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async getErrorOverview() {
    try {
      const brands = await this.db.brandErrorSummary.findMany({
        orderBy: { totalErrors: 'desc' },
      });

      const totalAcrossAll = brands.reduce((sum, b) => sum + b.totalErrors, 0);
      const worstBrand = brands.length > 0 ? brands[0] : null;

      return { brands, totalAcrossAll, worstBrand };
    } catch (error) {
      this.logger.error('Failed to get error overview', (error as Error).stack);
      throw error;
    }
  }

  async getBrandErrors(brandId: string) {
    try {
      return await this.db.brandErrorSummary.findMany({
        where: { brandId },
        orderBy: { period: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to get brand errors: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }
}
