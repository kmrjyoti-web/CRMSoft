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
var ModuleRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRegistryService = void 0;
const common_1 = require("@nestjs/common");
const identity_client_1 = require("@prisma/identity-client");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../../common/utils/industry-filter.util");
let ModuleRegistryService = ModuleRegistryService_1 = class ModuleRegistryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ModuleRegistryService_1.name);
    }
    async list(query) {
        const page = Math.max(query?.page ?? 1, 1);
        const limit = Math.min(Math.max(query?.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.category) {
            where.category = query.category;
        }
        if (query?.status) {
            where.moduleStatus = query.status;
        }
        if (query?.industryCode) {
            Object.assign(where, (0, industry_filter_util_1.industryFilter)(query.industryCode));
        }
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.moduleDefinition.findMany({
                where,
                orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
                skip,
                take: limit,
            }),
            this.prisma.platform.moduleDefinition.count({ where }),
        ]);
        return { data, total };
    }
    async getById(id) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id },
            include: {
                _count: { select: { packageModules: true } },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${id} not found`);
        }
        return module;
    }
    async getByCode(code) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { code },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition with code '${code}' not found`);
        }
        return module;
    }
    async create(data) {
        return this.prisma.platform.moduleDefinition.create({
            data: {
                code: data.code,
                name: data.name,
                description: data.description ?? null,
                category: data.category,
                version: data.version ?? '1.0.0',
                moduleStatus: data.moduleStatus ?? 'ACTIVE',
                isCore: data.isCore ?? false,
                iconName: data.iconName ?? null,
                sortOrder: data.sortOrder ?? 0,
                dependsOn: data.dependsOn ?? [],
                features: data.features ?? [],
                menuKeys: data.menuKeys ?? [],
                defaultPricingType: data.defaultPricingType ?? 'INCLUDED',
                basePrice: data.basePrice ?? 0,
                priceMonthly: data.priceMonthly ?? null,
                priceYearly: data.priceYearly ?? null,
                oneTimeSetupFee: data.oneTimeSetupFee ?? null,
                trialDays: data.trialDays ?? 0,
                trialFeatures: data.trialFeatures ?? [],
                usagePricing: data.usagePricing ?? identity_client_1.Prisma.JsonNull,
                isFeatured: data.isFeatured ?? false,
                isActive: data.isActive ?? true,
            },
        });
    }
    async update(id, data) {
        const existing = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Module definition ${id} not found`);
        }
        const updateData = { ...data };
        if (data.category)
            updateData.category = data.category;
        if (data.moduleStatus)
            updateData.moduleStatus = data.moduleStatus;
        if (data.defaultPricingType)
            updateData.defaultPricingType = data.defaultPricingType;
        if ('usagePricing' in data && data.usagePricing === undefined) {
            updateData.usagePricing = identity_client_1.Prisma.JsonNull;
        }
        return this.prisma.platform.moduleDefinition.update({
            where: { id },
            data: updateData,
        });
    }
    async archive(id) {
        const existing = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Module definition ${id} not found`);
        }
        return this.prisma.platform.moduleDefinition.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async addFeature(moduleId, feature) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        const features = this.parseFeatures(module.features);
        if (features.some((f) => f.code === feature.code)) {
            throw new common_1.BadRequestException(`Feature with code '${feature.code}' already exists in module '${module.code}'`);
        }
        features.push(feature);
        return this.prisma.platform.moduleDefinition.update({
            where: { id: moduleId },
            data: { features: features },
        });
    }
    async updateFeature(moduleId, featureCode, updates) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        const features = this.parseFeatures(module.features);
        const index = features.findIndex((f) => f.code === featureCode);
        if (index === -1) {
            throw new common_1.NotFoundException(`Feature '${featureCode}' not found in module '${module.code}'`);
        }
        features[index] = { ...features[index], ...updates, code: featureCode };
        return this.prisma.platform.moduleDefinition.update({
            where: { id: moduleId },
            data: { features: features },
        });
    }
    async removeFeature(moduleId, featureCode) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        const features = this.parseFeatures(module.features);
        const filtered = features.filter((f) => f.code !== featureCode);
        if (filtered.length === features.length) {
            throw new common_1.NotFoundException(`Feature '${featureCode}' not found in module '${module.code}'`);
        }
        return this.prisma.platform.moduleDefinition.update({
            where: { id: moduleId },
            data: { features: filtered },
        });
    }
    async setMenuKeys(moduleId, menuKeys) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        return this.prisma.platform.moduleDefinition.update({
            where: { id: moduleId },
            data: { menuKeys },
        });
    }
    async getDependencyTree(moduleId) {
        const root = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!root) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        const result = [];
        const visited = new Set();
        const queue = [];
        for (const depCode of root.dependsOn) {
            if (!visited.has(depCode)) {
                visited.add(depCode);
                queue.push({ code: depCode, level: 1 });
            }
        }
        while (queue.length > 0) {
            const { code, level } = queue.shift();
            const dep = await this.prisma.platform.moduleDefinition.findUnique({
                where: { code },
                select: { code: true, name: true, dependsOn: true },
            });
            if (!dep) {
                this.logger.warn(`Dependency '${code}' referenced by module '${root.code}' not found`);
                result.push({ code, name: code, level });
                continue;
            }
            result.push({ code: dep.code, name: dep.name, level });
            for (const childCode of dep.dependsOn) {
                if (!visited.has(childCode)) {
                    visited.add(childCode);
                    queue.push({ code: childCode, level: level + 1 });
                }
            }
        }
        return result;
    }
    async setDependencies(moduleId, dependsOn) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        if (dependsOn.length > 0) {
            const existing = await this.prisma.platform.moduleDefinition.findMany({
                where: { code: { in: dependsOn } },
                select: { code: true },
            });
            const existingCodes = new Set(existing.map((m) => m.code));
            const missing = dependsOn.filter((c) => !existingCodes.has(c));
            if (missing.length > 0) {
                throw new common_1.BadRequestException(`Unknown dependency codes: ${missing.join(', ')}`);
            }
            if (dependsOn.includes(module.code)) {
                throw new common_1.BadRequestException(`Module '${module.code}' cannot depend on itself`);
            }
            await this.checkCircularDependency(module.code, dependsOn);
        }
        return this.prisma.platform.moduleDefinition.update({
            where: { id: moduleId },
            data: { dependsOn },
        });
    }
    async getSubscribers(moduleId, query) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${moduleId} not found`);
        }
        const page = Math.max(query?.page ?? 1, 1);
        const limit = Math.min(Math.max(query?.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;
        const where = { moduleId };
        const [data, total] = await Promise.all([
            this.prisma.platform.tenantModule.findMany({
                where,
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            status: true,
                        },
                    },
                },
                orderBy: { enabledAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.platform.tenantModule.count({ where }),
        ]);
        return { data, total };
    }
    parseFeatures(raw) {
        if (Array.isArray(raw))
            return raw;
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch {
                return [];
            }
        }
        return [];
    }
    async checkCircularDependency(moduleCode, newDeps) {
        const visited = new Set();
        const queue = [...newDeps];
        while (queue.length > 0) {
            const code = queue.shift();
            if (code === moduleCode) {
                throw new common_1.BadRequestException(`Circular dependency detected: '${moduleCode}' would transitively depend on itself`);
            }
            if (visited.has(code))
                continue;
            visited.add(code);
            const dep = await this.prisma.platform.moduleDefinition.findUnique({
                where: { code },
                select: { dependsOn: true },
            });
            if (dep) {
                for (const child of dep.dependsOn) {
                    if (!visited.has(child)) {
                        queue.push(child);
                    }
                }
            }
        }
    }
};
exports.ModuleRegistryService = ModuleRegistryService;
exports.ModuleRegistryService = ModuleRegistryService = ModuleRegistryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModuleRegistryService);
//# sourceMappingURL=module-registry.service.js.map