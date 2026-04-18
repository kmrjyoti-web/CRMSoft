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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecycleBinController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const api_response_1 = require("../../../common/utils/api-response");
let RecycleBinController = class RecycleBinController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll(entityType, limit) {
        const take = limit ? parseInt(limit, 10) : 10000;
        const items = [];
        const deletedByIds = new Set();
        const shouldInclude = (type) => !entityType || entityType === type;
        if (shouldInclude('contact')) {
            const contacts = await this.prisma.working.contact.findMany({
                where: { isDeleted: true },
                take,
                orderBy: { deletedAt: 'desc' },
            });
            for (const c of contacts) {
                if (c.deletedById)
                    deletedByIds.add(c.deletedById);
                items.push({
                    id: c.id,
                    entityType: 'contact',
                    name: `${c.firstName} ${c.lastName}`,
                    subtitle: c.designation ?? undefined,
                    deletedAt: c.deletedAt?.toISOString() ?? null,
                    deletedBy: c.deletedById ?? undefined,
                });
            }
        }
        if (shouldInclude('organization')) {
            const orgs = await this.prisma.working.organization.findMany({
                where: { isDeleted: true },
                take,
                orderBy: { deletedAt: 'desc' },
            });
            for (const o of orgs) {
                if (o.deletedById)
                    deletedByIds.add(o.deletedById);
                items.push({
                    id: o.id,
                    entityType: 'organization',
                    name: o.name,
                    subtitle: o.industry ?? undefined,
                    deletedAt: o.deletedAt?.toISOString() ?? null,
                    deletedBy: o.deletedById ?? undefined,
                });
            }
        }
        if (shouldInclude('lead')) {
            const leads = await this.prisma.working.lead.findMany({
                where: { isDeleted: true },
                take,
                orderBy: { deletedAt: 'desc' },
                include: {
                    contact: { select: { firstName: true, lastName: true } },
                },
            });
            for (const l of leads) {
                if (l.deletedById)
                    deletedByIds.add(l.deletedById);
                items.push({
                    id: l.id,
                    entityType: 'lead',
                    name: l.leadNumber,
                    subtitle: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : undefined,
                    deletedAt: l.deletedAt?.toISOString() ?? null,
                    deletedBy: l.deletedById ?? undefined,
                });
            }
        }
        if (shouldInclude('activity')) {
            const activities = await this.prisma.working.activity.findMany({
                where: { isDeleted: true },
                take,
                orderBy: { deletedAt: 'desc' },
            });
            for (const a of activities) {
                if (a.deletedById)
                    deletedByIds.add(a.deletedById);
                items.push({
                    id: a.id,
                    entityType: 'activity',
                    name: a.subject,
                    subtitle: a.type,
                    deletedAt: a.deletedAt?.toISOString() ?? null,
                    deletedBy: a.deletedById ?? undefined,
                });
            }
        }
        if (shouldInclude('raw_contact')) {
            const rcs = await this.prisma.working.rawContact.findMany({
                where: { isDeleted: true },
                take,
                orderBy: { deletedAt: 'desc' },
            });
            for (const r of rcs) {
                if (r.deletedById)
                    deletedByIds.add(r.deletedById);
                items.push({
                    id: r.id,
                    entityType: 'raw_contact',
                    name: `${r.firstName} ${r.lastName}`,
                    subtitle: r.companyName ?? undefined,
                    deletedAt: r.deletedAt?.toISOString() ?? null,
                    deletedBy: r.deletedById ?? undefined,
                });
            }
        }
        if (shouldInclude('user')) {
            const users = await this.prisma.user.findMany({
                where: { isDeleted: true },
                take,
                orderBy: { deletedAt: 'desc' },
            });
            for (const u of users) {
                if (u.deletedById)
                    deletedByIds.add(u.deletedById);
                items.push({
                    id: u.id,
                    entityType: 'user',
                    name: `${u.firstName} ${u.lastName}`,
                    subtitle: u.email,
                    deletedAt: u.deletedAt?.toISOString() ?? null,
                    deletedBy: u.deletedById ?? undefined,
                });
            }
        }
        if (deletedByIds.size > 0) {
            const deleters = await this.prisma.user.findMany({
                where: { id: { in: Array.from(deletedByIds) } },
                select: { id: true, firstName: true, lastName: true },
            });
            const deleterMap = new Map(deleters.map((d) => [d.id, `${d.firstName} ${d.lastName}`]));
            for (const item of items) {
                if (item.deletedBy && deleterMap.has(item.deletedBy)) {
                    item.deletedBy = deleterMap.get(item.deletedBy);
                }
            }
        }
        items.sort((a, b) => {
            if (!a.deletedAt)
                return 1;
            if (!b.deletedAt)
                return -1;
            return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
        });
        return api_response_1.ApiResponse.success(items, 'Recycle bin items fetched');
    }
};
exports.RecycleBinController = RecycleBinController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all soft-deleted records across all entities' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, description: 'Filter by entity type' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('entityType')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecycleBinController.prototype, "getAll", null);
exports.RecycleBinController = RecycleBinController = __decorate([
    (0, swagger_1.ApiTags)('Recycle Bin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recycle-bin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecycleBinController);
//# sourceMappingURL=recycle-bin.controller.js.map