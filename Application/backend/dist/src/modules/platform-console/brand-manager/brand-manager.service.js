"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BrandManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandManagerService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const brand_manager_errors_1 = require("./brand-manager.errors");
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
let BrandManagerService = BrandManagerService_1 = class BrandManagerService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(BrandManagerService_1.name);
    }
    async getBrands() {
        try {
            const whitelistRecords = await this.db.brandModuleWhitelist.findMany();
            const brandIds = [...new Set(whitelistRecords.map((r) => r.brandId))];
            const results = await Promise.all(brandIds.map(async (brandId) => {
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
            }));
            return results;
        }
        catch (error) {
            this.logger.error('Failed to get brands', error.stack);
            throw error;
        }
    }
    async getBrandDetail(brandId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get brand detail: ${brandId}`, error.stack);
            throw error;
        }
    }
    async getModules(brandId) {
        try {
            return await this.db.brandModuleWhitelist.findMany({
                where: { brandId },
                orderBy: { enabledAt: 'desc' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get modules for brand: ${brandId}`, error.stack);
            throw error;
        }
    }
    async whitelistModule(brandId, dto) {
        try {
            const existing = await this.db.brandModuleWhitelist.findUnique({
                where: { brandId_moduleCode: { brandId, moduleCode: dto.moduleCode } },
            });
            if (existing) {
                const err = brand_manager_errors_1.BRAND_MANAGER_ERRORS.MODULE_ALREADY_WHITELISTED;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to whitelist module for brand: ${brandId}`, error.stack);
            throw error;
        }
    }
    async updateModule(id, data) {
        try {
            return await this.db.brandModuleWhitelist.update({
                where: { id },
                data: {
                    ...(data.status !== undefined && { status: data.status }),
                    ...(data.trialExpiresAt !== undefined && { trialExpiresAt: new Date(data.trialExpiresAt) }),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update module: ${id}`, error.stack);
            throw error;
        }
    }
    async removeModule(id) {
        try {
            return await this.db.brandModuleWhitelist.delete({ where: { id } });
        }
        catch (error) {
            this.logger.error(`Failed to remove module: ${id}`, error.stack);
            throw error;
        }
    }
    async getFeatures(brandId) {
        try {
            const flags = await this.db.brandFeatureFlag.findMany({
                where: { brandId },
            });
            return { flags, allFeatureCodes: FEATURE_CODES };
        }
        catch (error) {
            this.logger.error(`Failed to get features for brand: ${brandId}`, error.stack);
            throw error;
        }
    }
    async setFeatureFlag(brandId, dto) {
        try {
            if (!FEATURE_CODES.includes(dto.featureCode)) {
                const err = brand_manager_errors_1.BRAND_MANAGER_ERRORS.INVALID_FEATURE_CODE;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return await this.db.brandFeatureFlag.upsert({
                where: { brandId_featureCode: { brandId, featureCode: dto.featureCode } },
                update: {
                    isEnabled: dto.isEnabled,
                    config: (dto.config ?? {}),
                    updatedAt: new Date(),
                },
                create: {
                    brandId,
                    featureCode: dto.featureCode,
                    isEnabled: dto.isEnabled,
                    config: (dto.config ?? {}),
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to set feature flag for brand: ${brandId}`, error.stack);
            throw error;
        }
    }
    async updateFeatureFlag(id, data) {
        try {
            return await this.db.brandFeatureFlag.update({
                where: { id },
                data: {
                    ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
                    ...(data.config !== undefined && { config: data.config }),
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update feature flag: ${id}`, error.stack);
            throw error;
        }
    }
    async removeFeatureFlag(id) {
        try {
            return await this.db.brandFeatureFlag.delete({ where: { id } });
        }
        catch (error) {
            this.logger.error(`Failed to remove feature flag: ${id}`, error.stack);
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
        }
        catch (error) {
            this.logger.error('Failed to get error overview', error.stack);
            throw error;
        }
    }
    async getBrandErrors(brandId) {
        try {
            return await this.db.brandErrorSummary.findMany({
                where: { brandId },
                orderBy: { period: 'desc' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get brand errors: ${brandId}`, error.stack);
            throw error;
        }
    }
};
exports.BrandManagerService = BrandManagerService;
exports.BrandManagerService = BrandManagerService = BrandManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], BrandManagerService);
//# sourceMappingURL=brand-manager.service.js.map