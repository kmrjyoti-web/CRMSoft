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
exports.SubscriptionPackageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../common/utils/industry-filter.util");
let SubscriptionPackageService = class SubscriptionPackageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listAll(activeOnly, industryCode) {
        const where = { ...(0, industry_filter_util_1.industryFilter)(industryCode) };
        if (activeOnly)
            where.isActive = true;
        return this.prisma.platform.subscriptionPackage.findMany({
            where,
            orderBy: { planLevel: 'asc' },
            include: { coupons: { where: { isActive: true }, select: { id: true, code: true } } },
        });
    }
    async getByCode(code) {
        const pkg = await this.prisma.platform.subscriptionPackage.findUnique({
            where: { packageCode: code },
            include: { coupons: true },
        });
        if (!pkg)
            throw new common_1.NotFoundException(`Package with code "${code}" not found`);
        return pkg;
    }
    async create(data) {
        return this.prisma.platform.subscriptionPackage.create({
            data: {
                packageCode: data.packageCode.toUpperCase(),
                packageName: data.packageName,
                tagline: data.tagline,
                applicableTypes: data.applicableTypes ?? ['ALL'],
                includedModules: data.includedModules ?? [],
                limits: data.limits ?? {},
                priceMonthlyInr: data.priceMonthlyInr,
                priceYearlyInr: data.priceYearlyInr,
                yearlyDiscountPct: data.yearlyDiscountPct ?? 20,
                trialDays: data.trialDays ?? 14,
                featureFlags: data.featureFlags ?? {},
                planLevel: data.planLevel,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                sortOrder: data.sortOrder ?? 0,
            },
        });
    }
    async update(id, data) {
        const existing = await this.prisma.platform.subscriptionPackage.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Package "${id}" not found`);
        return this.prisma.platform.subscriptionPackage.update({
            where: { id },
            data: data,
        });
    }
    async deactivate(id) {
        const existing = await this.prisma.platform.subscriptionPackage.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Package "${id}" not found`);
        return this.prisma.platform.subscriptionPackage.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async getFeatured(industryCode) {
        return this.prisma.platform.subscriptionPackage.findMany({
            where: { isActive: true, isFeatured: true, ...(0, industry_filter_util_1.industryFilter)(industryCode) },
            orderBy: { sortOrder: 'asc' },
        });
    }
};
exports.SubscriptionPackageService = SubscriptionPackageService;
exports.SubscriptionPackageService = SubscriptionPackageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionPackageService);
//# sourceMappingURL=subscription-package.service.js.map