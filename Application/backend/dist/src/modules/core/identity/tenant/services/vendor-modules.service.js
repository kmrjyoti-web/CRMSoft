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
exports.VendorModulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let VendorModulesService = class VendorModulesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const STATUS_MAP = {
            ACTIVE: 'PUBLISHED',
            INACTIVE: 'SUSPENDED',
        };
        const where = {};
        if (filters.status)
            where.status = STATUS_MAP[filters.status] ?? filters.status;
        if (filters.vendorId)
            where.vendorId = filters.vendorId;
        const [rawData, total] = await Promise.all([
            this.prisma.platform.marketplaceModule.findMany({
                where,
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.platform.marketplaceModule.count({ where }),
        ]);
        const data = rawData.map((m) => ({
            id: m.id,
            code: m.moduleCode,
            name: m.moduleName,
            description: m.shortDescription,
            category: m.category,
            version: m.version,
            status: m.status === 'PUBLISHED' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'INACTIVE' : m.status,
            features: [],
            pricing: { monthly: 0, yearly: 0 },
            subscriberCount: m.installCount,
            dependsOn: [],
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
        }));
        return { data, total };
    }
    async getById(id) {
        const m = await this.prisma.platform.marketplaceModule.findUnique({ where: { id } });
        if (!m)
            return null;
        return {
            id: m.id,
            code: m.moduleCode,
            name: m.moduleName,
            description: m.shortDescription,
            category: m.category,
            version: m.version,
            status: m.status === 'PUBLISHED' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'INACTIVE' : m.status,
            features: [],
            pricing: { monthly: 0, yearly: 0 },
            subscriberCount: m.installCount,
            dependsOn: [],
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
        };
    }
    async create(data) {
        return this.prisma.platform.marketplaceModule.create({ data });
    }
    async update(id, data) {
        return this.prisma.platform.marketplaceModule.update({ where: { id }, data: data });
    }
    async deactivate(id) {
        return this.prisma.platform.marketplaceModule.update({
            where: { id },
            data: { status: 'SUSPENDED' },
        });
    }
};
exports.VendorModulesService = VendorModulesService;
exports.VendorModulesService = VendorModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorModulesService);
//# sourceMappingURL=vendor-modules.service.js.map