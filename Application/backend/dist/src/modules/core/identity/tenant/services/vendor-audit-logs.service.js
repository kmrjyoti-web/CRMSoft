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
exports.VendorAuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let VendorAuditLogsService = class VendorAuditLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {};
        if (filters.tenantId)
            where.tenantId = filters.tenantId;
        if (filters.category)
            where.category = filters.category;
        if (filters.action)
            where.action = { contains: filters.action, mode: 'insensitive' };
        const [data, total] = await Promise.all([
            this.prisma.platform.tenantActivityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
            }),
            this.prisma.platform.tenantActivityLog.count({ where }),
        ]);
        return { data, total };
    }
};
exports.VendorAuditLogsService = VendorAuditLogsService;
exports.VendorAuditLogsService = VendorAuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorAuditLogsService);
//# sourceMappingURL=vendor-audit-logs.service.js.map