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
exports.PackageBuilderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let PackageBuilderService = class PackageBuilderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const page = query?.page ?? 1;
        const limit = query?.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        if (query?.search) {
            where.OR = [
                { packageName: { contains: query.search, mode: 'insensitive' } },
                { packageCode: { contains: query.search, mode: 'insensitive' } },
                { tagline: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.subscriptionPackage.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                include: {
                    _count: { select: { packageModules: true } },
                },
            }),
            this.prisma.platform.subscriptionPackage.count({ where }),
        ]);
        return { data, total };
    }
    async getById(id) {
        const pkg = await this.prisma.platform.subscriptionPackage.findUnique({
            where: { id },
            include: {
                packageModules: {
                    orderBy: { sortOrder: 'asc' },
                    include: { module: true },
                },
            },
        });
        if (!pkg) {
            throw new common_1.NotFoundException(`Package with id "${id}" not found`);
        }
        return pkg;
    }
    async create(data) {
        const existing = await this.prisma.platform.subscriptionPackage.findUnique({
            where: { packageCode: data.packageCode },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Package code "${data.packageCode}" already exists`);
        }
        return this.prisma.platform.subscriptionPackage.create({
            data: {
                packageCode: data.packageCode,
                packageName: data.packageName,
                tagline: data.tagline,
                description: data.description,
                tier: data.tier ?? 0,
                priceMonthlyInr: data.priceMonthlyInr,
                quarterlyPrice: data.quarterlyPrice,
                priceYearlyInr: data.priceYearlyInr,
                yearlyDiscountPct: data.yearlyDiscountPct ?? 20,
                oneTimeSetupFee: data.oneTimeSetupFee,
                currency: data.currency ?? 'INR',
                trialDays: data.trialDays ?? 14,
                entityLimits: (data.entityLimits ?? {}),
                hasDedicatedDb: data.hasDedicatedDb ?? false,
                maxDbSizeMb: data.maxDbSizeMb,
                isPopular: data.isPopular ?? false,
                badgeText: data.badgeText,
                color: data.color,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                isPublic: data.isPublic ?? true,
                sortOrder: data.sortOrder ?? 0,
            },
            include: {
                _count: { select: { packageModules: true } },
            },
        });
    }
    async update(id, data) {
        await this.ensurePackageExists(id);
        return this.prisma.platform.subscriptionPackage.update({
            where: { id },
            data: data,
            include: {
                packageModules: {
                    orderBy: { sortOrder: 'asc' },
                    include: { module: true },
                },
            },
        });
    }
    async archive(id) {
        await this.ensurePackageExists(id);
        return this.prisma.platform.subscriptionPackage.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async addModule(packageId, dto) {
        await this.ensurePackageExists(packageId);
        const moduleDef = await this.prisma.platform.moduleDefinition.findUnique({
            where: { id: dto.moduleId },
        });
        if (!moduleDef) {
            throw new common_1.NotFoundException(`Module with id "${dto.moduleId}" not found`);
        }
        const existing = await this.prisma.platform.packageModule.findUnique({
            where: {
                packageId_moduleId: { packageId, moduleId: dto.moduleId },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Module "${moduleDef.name}" is already added to this package`);
        }
        return this.prisma.platform.packageModule.create({
            data: {
                packageId,
                moduleId: dto.moduleId,
                pricingType: dto.pricingType ?? 'INCLUDED',
                addonPrice: dto.addonPrice,
                oneTimeFee: dto.oneTimeFee,
                enabledFeatures: dto.enabledFeatures ?? [],
                disabledFeatures: dto.disabledFeatures ?? [],
                trialAllowed: dto.trialAllowed ?? true,
                trialDays: dto.trialDays,
                moduleLimits: dto.moduleLimits ? dto.moduleLimits : undefined,
                sortOrder: dto.sortOrder ?? 0,
            },
            include: { module: true },
        });
    }
    async updateModule(packageId, moduleId, updates) {
        const pkgModule = await this.prisma.platform.packageModule.findUnique({
            where: {
                packageId_moduleId: { packageId, moduleId },
            },
        });
        if (!pkgModule) {
            throw new common_1.NotFoundException(`PackageModule with packageId="${packageId}" and moduleId="${moduleId}" not found`);
        }
        return this.prisma.platform.packageModule.update({
            where: {
                packageId_moduleId: { packageId, moduleId },
            },
            data: updates,
            include: { module: true },
        });
    }
    async removeModule(packageId, moduleId) {
        const pkgModule = await this.prisma.platform.packageModule.findUnique({
            where: {
                packageId_moduleId: { packageId, moduleId },
            },
        });
        if (!pkgModule) {
            throw new common_1.NotFoundException(`PackageModule with packageId="${packageId}" and moduleId="${moduleId}" not found`);
        }
        return this.prisma.platform.packageModule.delete({
            where: {
                packageId_moduleId: { packageId, moduleId },
            },
        });
    }
    async updateLimits(packageId, entityLimits) {
        await this.ensurePackageExists(packageId);
        return this.prisma.platform.subscriptionPackage.update({
            where: { id: packageId },
            data: { entityLimits: entityLimits },
        });
    }
    async getSubscribers(packageId, _query) {
        await this.ensurePackageExists(packageId);
        return { data: [], total: 0 };
    }
    async getPackageComparison(packageIds) {
        if (!packageIds.length) {
            throw new common_1.BadRequestException('At least one package ID is required for comparison');
        }
        const packages = await this.prisma.platform.subscriptionPackage.findMany({
            where: { id: { in: packageIds } },
            orderBy: { tier: 'asc' },
            include: {
                packageModules: {
                    orderBy: { sortOrder: 'asc' },
                    include: { module: true },
                },
            },
        });
        if (packages.length !== packageIds.length) {
            const foundIds = new Set(packages.map((p) => p.id));
            const missing = packageIds.filter((pid) => !foundIds.has(pid));
            throw new common_1.NotFoundException(`Packages not found: ${missing.join(', ')}`);
        }
        return packages.map((pkg) => ({
            id: pkg.id,
            packageCode: pkg.packageCode,
            packageName: pkg.packageName,
            tagline: pkg.tagline,
            tier: pkg.tier,
            priceMonthlyInr: pkg.priceMonthlyInr,
            priceYearlyInr: pkg.priceYearlyInr,
            yearlyDiscountPct: pkg.yearlyDiscountPct,
            oneTimeSetupFee: pkg.oneTimeSetupFee,
            currency: pkg.currency,
            trialDays: pkg.trialDays,
            entityLimits: pkg.entityLimits,
            hasDedicatedDb: pkg.hasDedicatedDb,
            maxDbSizeMb: pkg.maxDbSizeMb,
            isPopular: pkg.isPopular,
            badgeText: pkg.badgeText,
            color: pkg.color,
            modules: pkg.packageModules.map((pm) => ({
                moduleId: pm.moduleId,
                moduleName: pm.module.name,
                moduleCode: pm.module.code,
                category: pm.module.category,
                pricingType: pm.pricingType,
                addonPrice: pm.addonPrice,
                oneTimeFee: pm.oneTimeFee,
                enabledFeatures: pm.enabledFeatures,
                disabledFeatures: pm.disabledFeatures,
                trialAllowed: pm.trialAllowed,
                trialDays: pm.trialDays,
                moduleLimits: pm.moduleLimits,
            })),
        }));
    }
    async ensurePackageExists(id) {
        const pkg = await this.prisma.platform.subscriptionPackage.findUnique({
            where: { id },
        });
        if (!pkg) {
            throw new common_1.NotFoundException(`Package with id "${id}" not found`);
        }
        return pkg;
    }
};
exports.PackageBuilderService = PackageBuilderService;
exports.PackageBuilderService = PackageBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PackageBuilderService);
//# sourceMappingURL=package-builder.service.js.map