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
var LicenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let LicenseService = LicenseService_1 = class LicenseService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LicenseService_1.name);
    }
    generateKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const group = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `CRM-${group()}-${group()}-${group()}-${group()}`;
    }
    async generate(data) {
        const tenant = await this.prisma.identity.tenant.findUnique({ where: { id: data.tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${data.tenantId} not found`);
        }
        const plan = await this.prisma.identity.plan.findUnique({ where: { id: data.planId } });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan ${data.planId} not found`);
        }
        const licenseKey = this.generateKey();
        const license = await this.prisma.platform.licenseKey.create({
            data: {
                tenantId: data.tenantId,
                licenseKey,
                planId: data.planId,
                status: 'LIC_ACTIVE',
                activatedAt: new Date(),
                expiresAt: data.expiresAt ?? null,
                maxUsers: data.maxUsers ?? 5,
                allowedModules: data.allowedModules ?? null,
                notes: data.notes ?? null,
            },
        });
        this.logger.log(`License generated: ${licenseKey} for tenant ${data.tenantId}`);
        return license;
    }
    async validate(key) {
        const license = await this.prisma.platform.licenseKey.findUnique({
            where: { licenseKey: key },
            include: {
                tenant: { select: { id: true, name: true, status: true } },
            },
        });
        if (!license) {
            return { valid: false, reason: 'License key not found' };
        }
        if (license.status !== 'LIC_ACTIVE') {
            return { valid: false, license, reason: `License status is ${license.status}` };
        }
        if (license.expiresAt && license.expiresAt < new Date()) {
            await this.prisma.platform.licenseKey.update({
                where: { id: license.id },
                data: { status: 'LIC_EXPIRED' },
            });
            return { valid: false, license, reason: 'License has expired' };
        }
        await this.prisma.platform.licenseKey.update({
            where: { id: license.id },
            data: { lastValidatedAt: new Date() },
        });
        return { valid: true, license };
    }
    async revoke(id) {
        const license = await this.prisma.platform.licenseKey.findUnique({ where: { id } });
        if (!license) {
            throw new common_1.NotFoundException(`License ${id} not found`);
        }
        return this.prisma.platform.licenseKey.update({
            where: { id },
            data: { status: 'LIC_REVOKED' },
        });
    }
    async suspend(id) {
        const license = await this.prisma.platform.licenseKey.findUnique({ where: { id } });
        if (!license) {
            throw new common_1.NotFoundException(`License ${id} not found`);
        }
        return this.prisma.platform.licenseKey.update({
            where: { id },
            data: { status: 'LIC_SUSPENDED' },
        });
    }
    async activate(id) {
        const license = await this.prisma.platform.licenseKey.findUnique({ where: { id } });
        if (!license) {
            throw new common_1.NotFoundException(`License ${id} not found`);
        }
        return this.prisma.platform.licenseKey.update({
            where: { id },
            data: { status: 'LIC_ACTIVE', activatedAt: new Date() },
        });
    }
    async getByTenant(tenantId) {
        return this.prisma.platform.licenseKey.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(id) {
        const license = await this.prisma.platform.licenseKey.findUnique({
            where: { id },
            include: {
                tenant: { select: { id: true, name: true, slug: true, status: true } },
            },
        });
        if (!license) {
            throw new common_1.NotFoundException(`License ${id} not found`);
        }
        return license;
    }
    async listAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const STATUS_MAP = {
            ACTIVE: 'LIC_ACTIVE',
            EXPIRED: 'LIC_EXPIRED',
            REVOKED: 'LIC_REVOKED',
            SUSPENDED: 'LIC_SUSPENDED',
        };
        const where = {};
        if (query.status) {
            where.status = STATUS_MAP[query.status] ?? query.status;
        }
        if (query.search) {
            where.OR = [
                { licenseKey: { contains: query.search, mode: 'insensitive' } },
                { tenant: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.licenseKey.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    tenant: { select: { id: true, name: true, slug: true } },
                },
            }),
            this.prisma.platform.licenseKey.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async checkExpiry() {
        const now = new Date();
        const expiredLicenses = await this.prisma.platform.licenseKey.findMany({
            where: {
                status: 'LIC_ACTIVE',
                expiresAt: { lt: now },
            },
        });
        if (expiredLicenses.length === 0) {
            return { expired: 0 };
        }
        const result = await this.prisma.platform.licenseKey.updateMany({
            where: {
                status: 'LIC_ACTIVE',
                expiresAt: { lt: now },
            },
            data: { status: 'LIC_EXPIRED' },
        });
        this.logger.log(`License expiry check: ${result.count} licenses expired`);
        return { expired: result.count };
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = LicenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LicenseService);
//# sourceMappingURL=license.service.js.map