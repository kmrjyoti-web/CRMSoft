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
var VendorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const app_error_1 = require("../../../common/errors/app-error");
let VendorService = VendorService_1 = class VendorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(VendorService_1.name);
    }
    async register(data) {
        const existing = await this.prisma.platform.marketplaceVendor.findUnique({
            where: { contactEmail: data.contactEmail },
        });
        if (existing) {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                contactEmail: 'A vendor with this email already exists',
            });
        }
        return this.prisma.platform.marketplaceVendor.create({
            data: {
                companyName: data.companyName,
                contactEmail: data.contactEmail,
                gstNumber: data.gstNumber ?? null,
                revenueSharePct: data.revenueSharePct ?? 70,
                status: 'PENDING',
            },
        });
    }
    async approve(vendorId) {
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
            where: { id: vendorId },
        });
        if (!vendor) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
        }
        if (vendor.status === 'APPROVED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: 'Vendor is already approved',
            });
        }
        return this.prisma.platform.marketplaceVendor.update({
            where: { id: vendorId },
            data: {
                status: 'APPROVED',
                verifiedAt: new Date(),
            },
        });
    }
    async suspend(vendorId) {
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
            where: { id: vendorId },
        });
        if (!vendor) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
        }
        if (vendor.status === 'SUSPENDED') {
            throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({
                status: 'Vendor is already suspended',
            });
        }
        return this.prisma.platform.marketplaceVendor.update({
            where: { id: vendorId },
            data: { status: 'SUSPENDED' },
        });
    }
    async listAll(query) {
        const page = Math.max(1, +(query?.page || '1'));
        const limit = Math.min(100, Math.max(1, +(query?.limit || '20')));
        const where = {};
        if (query?.status) {
            where.status = query.status;
        }
        if (query?.search) {
            where.OR = [
                { companyName: { contains: query.search, mode: 'insensitive' } },
                { contactEmail: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.marketplaceVendor.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { modules: true } },
                },
            }),
            this.prisma.platform.marketplaceVendor.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(id) {
        const vendor = await this.prisma.platform.marketplaceVendor.findUnique({
            where: { id },
            include: {
                _count: { select: { modules: true } },
                modules: {
                    select: {
                        id: true,
                        moduleCode: true,
                        moduleName: true,
                        status: true,
                        installCount: true,
                        avgRating: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!vendor) {
            throw app_error_1.AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
        }
        return vendor;
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = VendorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map