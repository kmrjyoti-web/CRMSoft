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
exports.PageRegistryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../../common/utils/industry-filter.util");
let PageRegistryService = class PageRegistryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const page = Math.max(filters.page || 1, 1);
        const limit = Math.min(Math.max(filters.limit || 20, 1), 200);
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.portal)
            where.portal = filters.portal;
        if (filters.category)
            where.category = filters.category;
        if (filters.pageType)
            where.pageType = filters.pageType;
        if (filters.moduleCode)
            where.moduleCode = filters.moduleCode;
        if (filters.unassigned)
            where.moduleCode = null;
        if (filters.industryCode) {
            Object.assign(where, (0, industry_filter_util_1.industryFilter)(filters.industryCode));
        }
        if (filters.search) {
            where.OR = [
                { friendlyName: { contains: filters.search, mode: 'insensitive' } },
                { routePath: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.pageRegistry.findMany({
                where,
                orderBy: [{ portal: 'asc' }, { category: 'asc' }, { menuSortOrder: 'asc' }],
                skip,
                take: limit,
            }),
            this.prisma.platform.pageRegistry.count({ where }),
        ]);
        return { data, total };
    }
    async getById(id) {
        const page = await this.prisma.platform.pageRegistry.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return page;
    }
    async update(id, dto) {
        await this.getById(id);
        return this.prisma.platform.pageRegistry.update({ where: { id }, data: dto });
    }
    async getStats() {
        const [total, byPortal, byCategory, byPageType, unassigned, byModule] = await Promise.all([
            this.prisma.platform.pageRegistry.count(),
            this.prisma.platform.pageRegistry.groupBy({ by: ['portal'], _count: true }),
            this.prisma.platform.pageRegistry.groupBy({ by: ['category'], _count: true }),
            this.prisma.platform.pageRegistry.groupBy({ by: ['pageType'], _count: true }),
            this.prisma.platform.pageRegistry.count({ where: { moduleCode: null } }),
            this.prisma.platform.pageRegistry.groupBy({
                by: ['moduleCode'],
                _count: true,
                where: { moduleCode: { not: null } },
            }),
        ]);
        return {
            total,
            unassigned,
            byPortal: byPortal.map((g) => ({ portal: g.portal, count: g._count })),
            byCategory: byCategory.map((g) => ({
                category: g.category || 'Uncategorized',
                count: g._count,
            })),
            byPageType: byPageType.map((g) => ({
                pageType: g.pageType || 'Unknown',
                count: g._count,
            })),
            byModule: byModule.map((g) => ({
                moduleCode: g.moduleCode,
                count: g._count,
            })),
        };
    }
    async getUnassigned(filters) {
        return this.list({ ...filters, unassigned: true });
    }
    async assignToModule(id, dto) {
        await this.getById(id);
        return this.prisma.platform.pageRegistry.update({
            where: { id },
            data: {
                moduleCode: dto.moduleCode,
                friendlyName: dto.friendlyName,
                menuIcon: dto.menuIcon,
                menuLabel: dto.menuLabel,
                menuParentKey: dto.menuParentKey,
                menuSortOrder: dto.menuSortOrder,
                showInMenu: dto.showInMenu,
            },
        });
    }
    async bulkAssign(dto) {
        const result = await this.prisma.platform.pageRegistry.updateMany({
            where: { id: { in: dto.pageIds } },
            data: { moduleCode: dto.moduleCode },
        });
        return { updated: result.count };
    }
    async unassignFromModule(id) {
        await this.getById(id);
        return this.prisma.platform.pageRegistry.update({
            where: { id },
            data: { moduleCode: null, menuKey: null },
        });
    }
    async getModulePages(moduleCode) {
        return this.prisma.platform.pageRegistry.findMany({
            where: { moduleCode },
            orderBy: { menuSortOrder: 'asc' },
        });
    }
    async reorderModulePages(moduleCode, orderedIds) {
        const updates = orderedIds.map((id, index) => this.prisma.platform.pageRegistry.update({
            where: { id },
            data: { menuSortOrder: index },
        }));
        await this.prisma.identity.$transaction(updates);
        return this.getModulePages(moduleCode);
    }
};
exports.PageRegistryService = PageRegistryService;
exports.PageRegistryService = PageRegistryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PageRegistryService);
//# sourceMappingURL=page-registry.service.js.map