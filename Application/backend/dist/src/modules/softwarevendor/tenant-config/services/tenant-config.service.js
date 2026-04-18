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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const config_seeder_service_1 = require("./config-seeder.service");
let TenantConfigService = class TenantConfigService {
    constructor(prisma, seeder) {
        this.prisma = prisma;
        this.seeder = seeder;
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async get(tenantId, key) {
        const cacheKey = `${tenantId}:${key}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.value;
        }
        const config = await this.prisma.tenantConfig.findFirst({
            where: { tenantId, configKey: key },
        });
        if (!config)
            return null;
        const value = config.configValue ?? config.defaultValue ?? null;
        if (value !== null) {
            this.cache.set(cacheKey, { value, expiresAt: Date.now() + this.CACHE_TTL });
        }
        return value;
    }
    async getInt(tenantId, key) {
        const val = await this.get(tenantId, key);
        return val !== null ? parseInt(val, 10) : null;
    }
    async getDecimal(tenantId, key) {
        const val = await this.get(tenantId, key);
        return val !== null ? parseFloat(val) : null;
    }
    async getBool(tenantId, key) {
        const val = await this.get(tenantId, key);
        return val !== null ? val === 'true' : null;
    }
    async getJson(tenantId, key) {
        const val = await this.get(tenantId, key);
        if (val === null)
            return null;
        try {
            return JSON.parse(val);
        }
        catch {
            return null;
        }
    }
    async getByCategory(tenantId, category) {
        const configs = await this.prisma.tenantConfig.findMany({
            where: { tenantId, category, isVisible: true },
            orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }],
        });
        const grouped = {};
        for (const cfg of configs) {
            const group = cfg.groupName || 'General';
            if (!grouped[group])
                grouped[group] = [];
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
    async getAll(tenantId) {
        const configs = await this.prisma.tenantConfig.findMany({
            where: { tenantId, isVisible: true },
            orderBy: [{ category: 'asc' }, { groupName: 'asc' }, { sortOrder: 'asc' }],
        });
        const byCategory = {};
        for (const cfg of configs) {
            if (!byCategory[cfg.category])
                byCategory[cfg.category] = [];
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
    async set(tenantId, key, value, userId, userName) {
        const config = await this.prisma.tenantConfig.findFirst({
            where: { tenantId, configKey: key },
        });
        if (!config) {
            throw new common_1.BadRequestException(`Config key '${key}' not found`);
        }
        if (config.isReadOnly) {
            throw new common_1.BadRequestException(`Config '${key}' is read-only`);
        }
        this.validateValue(config, value);
        await this.prisma.tenantConfig.update({
            where: { id: config.id },
            data: {
                configValue: value,
                updatedById: userId,
                updatedByName: userName,
            },
        });
        this.cache.delete(`${tenantId}:${key}`);
    }
    async bulkSet(tenantId, configs, userId, userName) {
        let updated = 0;
        for (const { key, value } of configs) {
            await this.set(tenantId, key, value, userId, userName);
            updated++;
        }
        return { updated };
    }
    async resetToDefault(tenantId, key, userId) {
        const config = await this.prisma.tenantConfig.findFirst({
            where: { tenantId, configKey: key },
        });
        if (!config) {
            throw new common_1.BadRequestException(`Config key '${key}' not found`);
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
    async seedDefaults(tenantId) {
        return this.seeder.seedDefaults(tenantId);
    }
    validateValue(config, value) {
        switch (config.valueType) {
            case 'INTEGER': {
                const num = parseInt(value, 10);
                if (isNaN(num))
                    throw new common_1.BadRequestException(`'${config.configKey}' must be an integer`);
                if (config.minValue !== null && num < Number(config.minValue)) {
                    throw new common_1.BadRequestException(`'${config.configKey}' minimum is ${config.minValue}`);
                }
                if (config.maxValue !== null && num > Number(config.maxValue)) {
                    throw new common_1.BadRequestException(`'${config.configKey}' maximum is ${config.maxValue}`);
                }
                break;
            }
            case 'DECIMAL': {
                const dec = parseFloat(value);
                if (isNaN(dec))
                    throw new common_1.BadRequestException(`'${config.configKey}' must be a number`);
                break;
            }
            case 'BOOLEAN':
                if (value !== 'true' && value !== 'false') {
                    throw new common_1.BadRequestException(`'${config.configKey}' must be 'true' or 'false'`);
                }
                break;
            case 'JSON':
                try {
                    JSON.parse(value);
                }
                catch {
                    throw new common_1.BadRequestException(`'${config.configKey}' must be valid JSON`);
                }
                break;
            case 'ENUM': {
                const options = config.enumOptions;
                if (options && !options.includes(value)) {
                    throw new common_1.BadRequestException(`'${config.configKey}' must be one of: ${options.join(', ')}`);
                }
                break;
            }
        }
        if (config.validationRule) {
            const regex = new RegExp(config.validationRule);
            if (!regex.test(value)) {
                throw new common_1.BadRequestException(`'${config.configKey}' does not match the required format`);
            }
        }
    }
};
exports.TenantConfigService = TenantConfigService;
exports.TenantConfigService = TenantConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_seeder_service_1.ConfigSeederService])
], TenantConfigService);
//# sourceMappingURL=tenant-config.service.js.map