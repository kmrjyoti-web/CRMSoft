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
var BulkSeedMenusHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkSeedMenusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bulk_seed_menus_command_1 = require("./bulk-seed-menus.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let BulkSeedMenusHandler = BulkSeedMenusHandler_1 = class BulkSeedMenusHandler {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(BulkSeedMenusHandler_1.name);
    }
    async execute(cmd) {
        try {
            let explicitTenantId;
            if (cmd.isSuperAdmin && !cmd.tenantId) {
                const defaultTenantId = this.config.get('DEFAULT_TENANT_ID');
                if (defaultTenantId) {
                    explicitTenantId = defaultTenantId;
                }
                else {
                    const defaultTenant = await this.prisma.identity.tenant.findFirst({ where: { slug: 'default' } });
                    explicitTenantId = defaultTenant?.id;
                }
            }
            else if (cmd.tenantId) {
                explicitTenantId = cmd.tenantId;
            }
            const scopeFilter = explicitTenantId ? { tenantId: explicitTenantId } : {};
            const level2Menus = await this.prisma.identity.menu.findMany({
                where: { parentId: { not: null }, ...scopeFilter },
                select: { id: true },
            });
            const level2Ids = level2Menus.map((m) => m.id);
            if (level2Ids.length > 0) {
                await this.prisma.identity.menu.deleteMany({
                    where: { parentId: { in: level2Ids }, ...scopeFilter },
                });
            }
            await this.prisma.identity.menu.deleteMany({
                where: { parentId: { not: null }, ...scopeFilter },
            });
            await this.prisma.identity.menu.deleteMany({ where: { ...scopeFilter } });
            let count = 0;
            for (let i = 0; i < cmd.menus.length; i++) {
                const item = cmd.menus[i];
                const parent = await this.createMenu(item, null, i, explicitTenantId);
                count++;
                if (item.children) {
                    for (let j = 0; j < item.children.length; j++) {
                        const child = item.children[j];
                        const childMenu = await this.createMenu(child, parent.id, j, explicitTenantId);
                        count++;
                        if (child.children) {
                            for (let k = 0; k < child.children.length; k++) {
                                await this.createMenu(child.children[k], childMenu.id, k, explicitTenantId);
                                count++;
                            }
                        }
                    }
                }
            }
            return { seeded: count };
        }
        catch (error) {
            this.logger.error(`BulkSeedMenusHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createMenu(item, parentId, sortOrder, explicitTenantId) {
        return this.prisma.identity.menu.create({
            data: {
                ...(explicitTenantId ? { tenantId: explicitTenantId } : {}),
                name: item.name,
                code: item.code,
                icon: item.icon,
                route: item.route,
                parentId,
                sortOrder,
                menuType: item.menuType ?? 'ITEM',
                permissionModule: item.permissionModule,
                permissionAction: item.permissionAction ?? (item.permissionModule ? 'read' : undefined),
                badgeColor: item.badgeColor,
                badgeText: item.badgeText,
                openInNewTab: item.openInNewTab ?? false,
                isAdminOnly: item.isAdminOnly ?? false,
            },
        });
    }
};
exports.BulkSeedMenusHandler = BulkSeedMenusHandler;
exports.BulkSeedMenusHandler = BulkSeedMenusHandler = BulkSeedMenusHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(bulk_seed_menus_command_1.BulkSeedMenusCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], BulkSeedMenusHandler);
//# sourceMappingURL=bulk-seed-menus.handler.js.map