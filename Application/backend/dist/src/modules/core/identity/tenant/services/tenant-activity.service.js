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
exports.TenantActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let TenantActivityService = class TenantActivityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        return this.prisma.platform.tenantActivityLog.create({
            data: {
                tenantId: data.tenantId,
                action: data.action,
                category: data.category,
                details: data.details ?? null,
                metadata: data.metadata ?? null,
                performedById: data.performedById ?? null,
                ipAddress: data.ipAddress ?? null,
            },
        });
    }
    async getByTenant(tenantId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (query.category) {
            where.category = query.category;
        }
        if (query.dateFrom || query.dateTo) {
            where.createdAt = {};
            if (query.dateFrom) {
                where.createdAt.gte = query.dateFrom;
            }
            if (query.dateTo) {
                where.createdAt.lte = query.dateTo;
            }
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.tenantActivityLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.platform.tenantActivityLog.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getRecent(limit = 20) {
        return this.prisma.platform.tenantActivityLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
    }
};
exports.TenantActivityService = TenantActivityService;
exports.TenantActivityService = TenantActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantActivityService);
//# sourceMappingURL=tenant-activity.service.js.map