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
exports.TenantProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let TenantProfileService = class TenantProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByTenantId(tenantId) {
        const profile = await this.prisma.identity.tenantProfile.findUnique({
            where: { tenantId },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        domain: true,
                        logo: true,
                        status: true,
                        onboardingStep: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Tenant profile not found for tenant ${tenantId}`);
        }
        return profile;
    }
    async upsert(tenantId, data) {
        const tenant = await this.prisma.identity.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${tenantId} not found`);
        }
        return this.prisma.identity.tenantProfile.upsert({
            where: { tenantId },
            update: {
                companyLegalName: data.companyLegalName,
                industry: data.industry,
                website: data.website,
                supportEmail: data.supportEmail,
                dbStrategy: data.dbStrategy,
                dbConnectionString: data.dbConnectionString,
                primaryContactName: data.primaryContactName,
                primaryContactEmail: data.primaryContactEmail,
                primaryContactPhone: data.primaryContactPhone,
                billingAddress: data.billingAddress,
                gstin: data.gstin,
                pan: data.pan,
                accountManagerId: data.accountManagerId,
                notes: data.notes,
                tags: data.tags,
                maxDiskQuotaMb: data.maxDiskQuotaMb,
            },
            create: {
                tenantId,
                companyLegalName: data.companyLegalName,
                industry: data.industry,
                website: data.website,
                supportEmail: data.supportEmail,
                dbStrategy: data.dbStrategy ?? 'SHARED',
                dbConnectionString: data.dbConnectionString,
                primaryContactName: data.primaryContactName,
                primaryContactEmail: data.primaryContactEmail,
                primaryContactPhone: data.primaryContactPhone,
                billingAddress: data.billingAddress,
                gstin: data.gstin,
                pan: data.pan,
                accountManagerId: data.accountManagerId,
                notes: data.notes,
                tags: data.tags ?? [],
                maxDiskQuotaMb: data.maxDiskQuotaMb ?? 500,
            },
        });
    }
    async updateBilling(tenantId, data) {
        const profile = await this.prisma.identity.tenantProfile.findUnique({
            where: { tenantId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Tenant profile not found for tenant ${tenantId}`);
        }
        return this.prisma.identity.tenantProfile.update({
            where: { tenantId },
            data: {
                gstin: data.gstin,
                pan: data.pan,
                billingAddress: data.billingAddress,
            },
        });
    }
    async listAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { companyLegalName: { contains: query.search, mode: 'insensitive' } },
                { primaryContactName: { contains: query.search, mode: 'insensitive' } },
                { primaryContactEmail: { contains: query.search, mode: 'insensitive' } },
                { tenant: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        if (query.dbStrategy) {
            where.dbStrategy = query.dbStrategy;
        }
        const [data, total] = await Promise.all([
            this.prisma.identity.tenantProfile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
            }),
            this.prisma.identity.tenantProfile.count({ where }),
        ]);
        return { data, total, page, limit };
    }
};
exports.TenantProfileService = TenantProfileService;
exports.TenantProfileService = TenantProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantProfileService);
//# sourceMappingURL=tenant-profile.service.js.map