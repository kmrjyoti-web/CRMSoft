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
var GetMenuTreeHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMenuTreeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const get_menu_tree_query_1 = require("./get-menu-tree.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../../../../common/utils/industry-filter.util");
const MENU_SELECT = {
    id: true, name: true, code: true, icon: true, route: true,
    menuType: true, sortOrder: true, permissionModule: true,
    permissionAction: true, isActive: true, badgeColor: true,
    badgeText: true, openInNewTab: true, parentId: true,
};
let GetMenuTreeHandler = GetMenuTreeHandler_1 = class GetMenuTreeHandler {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(GetMenuTreeHandler_1.name);
    }
    async execute(query) {
        try {
            const childOrder = { orderBy: { sortOrder: 'asc' } };
            const tenantFilter = {};
            if (query.tenantId) {
                tenantFilter.tenantId = query.tenantId;
            }
            else if (query.isSuperAdmin) {
                const defaultTenantId = this.config.get('DEFAULT_TENANT_ID');
                let targetId = defaultTenantId;
                if (!targetId) {
                    const defaultTenant = await this.prisma.identity.tenant.findFirst({ where: { slug: 'default' } });
                    targetId = defaultTenant?.id;
                }
                if (targetId) {
                    tenantFilter.tenantId = targetId;
                }
            }
            return this.prisma.identity.menu.findMany({
                where: { parentId: null, ...tenantFilter, ...(0, industry_filter_util_1.industryFilter)(query.industryCode) },
                select: {
                    ...MENU_SELECT,
                    _count: { select: { children: true } },
                    children: {
                        select: {
                            ...MENU_SELECT,
                            _count: { select: { children: true } },
                            children: {
                                select: { ...MENU_SELECT, _count: { select: { children: true } } },
                                ...childOrder,
                            },
                        },
                        ...childOrder,
                    },
                },
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch (error) {
            this.logger.error(`GetMenuTreeHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMenuTreeHandler = GetMenuTreeHandler;
exports.GetMenuTreeHandler = GetMenuTreeHandler = GetMenuTreeHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_menu_tree_query_1.GetMenuTreeQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], GetMenuTreeHandler);
//# sourceMappingURL=get-menu-tree.handler.js.map