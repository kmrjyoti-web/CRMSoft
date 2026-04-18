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
var MarketplaceInstallService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceInstallService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const app_error_1 = require("../../../common/errors/app-error");
let MarketplaceInstallService = MarketplaceInstallService_1 = class MarketplaceInstallService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MarketplaceInstallService_1.name);
    }
    async install(tenantId, moduleId) {
        const mod = await this.prisma.platform.marketplaceModule.findUnique({
            where: { id: moduleId },
        });
        if (!mod) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Module' });
        }
        if (mod.status !== 'PUBLISHED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                module: 'Module is not available for installation',
            });
        }
        const existing = await this.prisma.platform.tenantMarketplaceModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId } },
        });
        if (existing && existing.status !== 'CANCELLED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                module: 'Module is already installed for this tenant',
            });
        }
        const trialDays = mod.launchOfferDays ?? 14;
        const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
        const installation = await this.prisma.platform.tenantMarketplaceModule.upsert({
            where: { tenantId_moduleId: { tenantId, moduleId } },
            update: {
                status: 'TRIAL',
                trialEndsAt,
                subscriptionId: null,
                planId: null,
                installedAt: new Date(),
            },
            create: {
                tenantId,
                moduleId,
                status: 'TRIAL',
                trialEndsAt,
            },
        });
        await this.prisma.platform.marketplaceModule.update({
            where: { id: moduleId },
            data: { installCount: { increment: 1 } },
        });
        return installation;
    }
    async activate(tenantId, moduleId, subscriptionId, planId) {
        const installation = await this.prisma.platform.tenantMarketplaceModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId } },
        });
        if (!installation) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({
                entity: 'Installation',
            });
        }
        if (installation.status === 'ACTIVE') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: 'Module is already active',
            });
        }
        if (installation.status === 'CANCELLED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: 'Cannot activate a cancelled installation. Please re-install first.',
            });
        }
        return this.prisma.platform.tenantMarketplaceModule.update({
            where: { tenantId_moduleId: { tenantId, moduleId } },
            data: {
                status: 'ACTIVE',
                subscriptionId: subscriptionId ?? null,
                planId: planId ?? null,
                trialEndsAt: null,
            },
        });
    }
    async cancel(tenantId, moduleId) {
        const installation = await this.prisma.platform.tenantMarketplaceModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId } },
        });
        if (!installation) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({
                entity: 'Installation',
            });
        }
        if (installation.status === 'CANCELLED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: 'Module is already cancelled',
            });
        }
        return this.prisma.platform.tenantMarketplaceModule.update({
            where: { tenantId_moduleId: { tenantId, moduleId } },
            data: { status: 'CANCELLED' },
        });
    }
    async listInstalled(tenantId) {
        return this.prisma.platform.tenantMarketplaceModule.findMany({
            where: { tenantId },
            include: {
                module: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                companyName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { installedAt: 'desc' },
        });
    }
    async checkInstalled(tenantId, moduleCode) {
        const installation = await this.prisma.platform.tenantMarketplaceModule.findFirst({
            where: {
                tenantId,
                module: { moduleCode },
                status: { in: ['TRIAL', 'ACTIVE'] },
            },
        });
        return !!installation;
    }
};
exports.MarketplaceInstallService = MarketplaceInstallService;
exports.MarketplaceInstallService = MarketplaceInstallService = MarketplaceInstallService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketplaceInstallService);
//# sourceMappingURL=marketplace-install.service.js.map