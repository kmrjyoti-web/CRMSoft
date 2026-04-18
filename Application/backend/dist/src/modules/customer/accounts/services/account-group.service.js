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
exports.AccountGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AccountGroupService = class AccountGroupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTree(tenantId) {
        const groups = await this.prisma.working.accountGroup.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
        const map = new Map(groups.map((g) => [g.id, { ...g, children: [] }]));
        const roots = [];
        for (const g of groups) {
            const node = map.get(g.id);
            if (g.parentId && map.has(g.parentId)) {
                map.get(g.parentId).children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    async getAll(tenantId) {
        return this.prisma.working.accountGroup.findMany({
            where: { tenantId, isActive: true },
            orderBy: [{ primaryGroup: 'asc' }, { name: 'asc' }],
        });
    }
    async getById(tenantId, id) {
        const group = await this.prisma.working.accountGroup.findFirst({
            where: { tenantId, id },
            include: {
                children: { where: { isActive: true } },
                ledgers: { where: { isActive: true }, select: { id: true, name: true, code: true, currentBalance: true } },
            },
        });
        if (!group)
            throw new common_1.NotFoundException('Account group not found');
        return group;
    }
    async create(tenantId, data) {
        const existing = await this.prisma.working.accountGroup.findFirst({ where: { tenantId, code: data.code } });
        if (existing)
            throw new common_1.BadRequestException(`Group code "${data.code}" already exists`);
        if (data.parentId) {
            const parent = await this.prisma.working.accountGroup.findFirst({ where: { tenantId, id: data.parentId } });
            if (!parent)
                throw new common_1.BadRequestException('Parent group not found');
        }
        return this.prisma.working.accountGroup.create({
            data: { tenantId, ...data },
        });
    }
    async update(tenantId, id, data) {
        const group = await this.prisma.working.accountGroup.findFirst({ where: { tenantId, id } });
        if (!group)
            throw new common_1.NotFoundException('Account group not found');
        return this.prisma.working.accountGroup.update({ where: { id }, data });
    }
    async delete(tenantId, id) {
        const group = await this.prisma.working.accountGroup.findFirst({
            where: { tenantId, id },
            include: { children: true, ledgers: { where: { isActive: true } } },
        });
        if (!group)
            throw new common_1.NotFoundException('Account group not found');
        if (group.isSystem)
            throw new common_1.BadRequestException('Cannot delete system groups');
        if (group.children.length > 0)
            throw new common_1.BadRequestException('Cannot delete group with sub-groups');
        if (group.ledgers.length > 0)
            throw new common_1.BadRequestException('Cannot delete group with ledgers');
        return this.prisma.working.accountGroup.update({ where: { id }, data: { isActive: false } });
    }
};
exports.AccountGroupService = AccountGroupService;
exports.AccountGroupService = AccountGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountGroupService);
//# sourceMappingURL=account-group.service.js.map