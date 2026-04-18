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
var PageMenuSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageMenuSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let PageMenuSyncService = PageMenuSyncService_1 = class PageMenuSyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PageMenuSyncService_1.name);
    }
    async syncModulePages(moduleCode) {
        const pages = await this.prisma.platform.pageRegistry.findMany({
            where: { moduleCode, showInMenu: true, isActive: true },
            orderBy: { menuSortOrder: 'asc' },
        });
        if (pages.length === 0) {
            return { synced: 0, tenants: 0 };
        }
        const tenants = await this.prisma.identity.tenant.findMany({
            select: { id: true },
        });
        let synced = 0;
        for (const tenant of tenants) {
            for (const page of pages) {
                const menuCode = page.menuKey || `page_${moduleCode}_${page.routePath.replace(/[/:]/g, '_')}`;
                const route = page.routePath.replace(/:(\w+)/g, '[$1]');
                let parentId = null;
                if (page.menuParentKey) {
                    const parentMenu = await this.prisma.identity.menu.findFirst({
                        where: { tenantId: tenant.id, code: page.menuParentKey },
                    });
                    parentId = parentMenu?.id || null;
                }
                const existingMenu = await this.prisma.identity.menu.findFirst({
                    where: { tenantId: tenant.id, code: menuCode },
                });
                if (existingMenu) {
                    await this.prisma.identity.menu.update({
                        where: { id: existingMenu.id },
                        data: {
                            name: page.menuLabel || page.friendlyName || page.routePath,
                            icon: page.menuIcon,
                            route,
                            sortOrder: page.menuSortOrder,
                            parentId,
                            isActive: true,
                            autoEnableWithModule: moduleCode,
                        },
                    });
                }
                else {
                    await this.prisma.identity.menu.create({
                        data: {
                            tenantId: tenant.id,
                            code: menuCode,
                            name: page.menuLabel || page.friendlyName || page.routePath,
                            icon: page.menuIcon,
                            route,
                            menuType: 'ITEM',
                            sortOrder: page.menuSortOrder,
                            parentId,
                            isActive: true,
                            autoEnableWithModule: moduleCode,
                        },
                    });
                }
                synced++;
            }
        }
        this.logger.log(`Synced ${pages.length} pages for module "${moduleCode}" across ${tenants.length} tenants (${synced} menu entries)`);
        return { synced, tenants: tenants.length };
    }
};
exports.PageMenuSyncService = PageMenuSyncService;
exports.PageMenuSyncService = PageMenuSyncService = PageMenuSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PageMenuSyncService);
//# sourceMappingURL=page-menu-sync.service.js.map