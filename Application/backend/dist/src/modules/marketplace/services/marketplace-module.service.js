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
var MarketplaceModuleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceModuleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const app_error_1 = require("../../../common/errors/app-error");
let MarketplaceModuleService = MarketplaceModuleService_1 = class MarketplaceModuleService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MarketplaceModuleService_1.name);
    }
    async create(vendorId, data) {
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
            where: { id: vendorId },
        });
        if (!vendor) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
        }
        if (vendor.status !== 'APPROVED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                vendor: 'Vendor must be approved before publishing modules',
            });
        }
        const existing = await this.prisma.platform.marketplaceModule.findUnique({
            where: { moduleCode: data.moduleCode },
        });
        if (existing) {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                moduleCode: 'A module with this code already exists',
            });
        }
        const launchOfferEnds = data.launchOfferDays
            ? new Date(Date.now() + data.launchOfferDays * 24 * 60 * 60 * 1000)
            : null;
        return this.prisma.platform.marketplaceModule.create({
            data: {
                vendorId,
                moduleCode: data.moduleCode,
                moduleName: data.moduleName,
                category: data.category,
                shortDescription: data.shortDescription,
                longDescription: data.longDescription,
                screenshots: data.screenshots ?? [],
                demoVideoUrl: data.demoVideoUrl ?? null,
                documentationUrl: data.documentationUrl ?? null,
                version: data.version ?? '1.0.0',
                pricingPlans: data.pricingPlans ?? [],
                usageLimits: data.usageLimits ?? {},
                targetTypes: data.targetTypes ?? ['ALL'],
                launchOfferDays: data.launchOfferDays ?? null,
                launchOfferEnds,
                status: 'DRAFT',
            },
        });
    }
    async update(moduleId, data) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { id: moduleId },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        const updateData = {};
        if (data.moduleName !== undefined)
            updateData.moduleName = data.moduleName;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.shortDescription !== undefined)
            updateData.shortDescription = data.shortDescription;
        if (data.longDescription !== undefined)
            updateData.longDescription = data.longDescription;
        if (data.screenshots !== undefined)
            updateData.screenshots = data.screenshots;
        if (data.demoVideoUrl !== undefined)
            updateData.demoVideoUrl = data.demoVideoUrl;
        if (data.documentationUrl !== undefined)
            updateData.documentationUrl = data.documentationUrl;
        if (data.version !== undefined)
            updateData.version = data.version;
        if (data.changelog !== undefined)
            updateData.changelog = data.changelog;
        if (data.pricingPlans !== undefined)
            updateData.pricingPlans = data.pricingPlans;
        if (data.usageLimits !== undefined)
            updateData.usageLimits = data.usageLimits;
        if (data.targetTypes !== undefined)
            updateData.targetTypes = data.targetTypes;
        if (data.launchOfferDays !== undefined) {
            updateData.launchOfferDays = data.launchOfferDays;
            updateData.launchOfferEnds = data.launchOfferDays
                ? new Date(Date.now() + data.launchOfferDays * 24 * 60 * 60 * 1000)
                : null;
        }
        return this.prisma.platform.marketplaceModule.update({
            where: { id: moduleId },
            data: updateData,
        });
    }
    async submitForReview(moduleId) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { id: moduleId },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        if (mod.status !== 'DRAFT') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: `Module must be in DRAFT status to submit for review. Current: ${mod.status}`,
            });
        }
        return this.prisma.platform.marketplaceModule.update({
            where: { id: moduleId },
            data: { status: 'REVIEW' },
        });
    }
    async publish(moduleId) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { id: moduleId },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        if (mod.status !== 'REVIEW') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: `Module must be in REVIEW status to publish. Current: ${mod.status}`,
            });
        }
        return this.prisma.platform.marketplaceModule.update({
            where: { id: moduleId },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
            },
        });
    }
    async suspend(moduleId) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { id: moduleId },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        if (mod.status === 'SUSPENDED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: 'Module is already suspended',
            });
        }
        return this.prisma.platform.marketplaceModule.update({
            where: { id: moduleId },
            data: { status: 'SUSPENDED' },
        });
    }
    async listPublished(query) {
        const page = Math.max(1, +(query?.page || '1'));
        const limit = Math.min(100, Math.max(1, +(query?.limit || '20')));
        const where = { status: 'PUBLISHED' };
        if (query?.category) {
            where.category = query.category;
        }
        if (query?.search) {
            where.OR = [
                { moduleName: { contains: query.search, mode: 'insensitive' } },
                { shortDescription: { contains: query.search, mode: 'insensitive' } },
                { moduleCode: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query?.businessType) {
            where.targetTypes = { array_contains: [query.businessType] };
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.marketplaceModule.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { installCount: 'desc' },
                include: {
                    vendor: {
                        select: {
                            id: true,
                            companyName: true,
                            status: true,
                        },
                    },
                },
            }),
            this.prisma.platform.marketplaceModule.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getDetail(moduleCode) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { moduleCode },
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                        contactEmail: true,
                        status: true,
                        verifiedAt: true,
                    },
                },
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        return mod;
    }
    async getFeatured() {
        const modules = await this.prisma.platform.marketplaceModule.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: [
                { avgRating: 'desc' },
                { installCount: 'desc' },
            ],
            take: 10,
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },
            },
        });
        return modules;
    }
};
exports.MarketplaceModuleService = MarketplaceModuleService;
exports.MarketplaceModuleService = MarketplaceModuleService = MarketplaceModuleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketplaceModuleService);
//# sourceMappingURL=marketplace-module.service.js.map