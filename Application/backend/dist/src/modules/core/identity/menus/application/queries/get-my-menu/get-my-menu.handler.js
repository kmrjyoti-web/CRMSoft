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
var GetMyMenuHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyMenuHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const get_my_menu_query_1 = require("./get-my-menu.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../../../../common/utils/industry-filter.util");
let GetMyMenuHandler = GetMyMenuHandler_1 = class GetMyMenuHandler {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(GetMyMenuHandler_1.name);
    }
    async execute(query) {
        try {
            if (query.isSuperAdmin || query.roleName === 'SUPER_ADMIN' || query.roleName === 'PLATFORM_ADMIN') {
                const defaultTenantId = this.config.get('DEFAULT_TENANT_ID');
                let tenantId = defaultTenantId;
                if (!tenantId) {
                    const defaultTenant = await this.prisma.identity.tenant.findFirst({ where: { slug: 'default' } });
                    tenantId = defaultTenant?.id;
                }
                const menus = tenantId
                    ? await this.prisma.identity.menu.findMany({
                        where: { isActive: true, tenantId },
                        orderBy: { sortOrder: 'asc' },
                    })
                    : [];
                return this.buildTree(menus);
            }
            const allMenus = await this.prisma.identity.menu.findMany({
                where: {
                    isActive: true,
                    tenantId: query.tenantId,
                    ...(0, industry_filter_util_1.industryFilter)(query.businessTypeCode),
                },
                orderBy: { sortOrder: 'asc' },
            });
            const enabledModules = await this.loadEnabledModules(query.tenantId);
            const validCredentials = await this.loadValidCredentials(query.tenantId);
            const terminology = await this.loadTerminology(query.tenantId);
            const userPerms = await this.loadRolePermissions(query.roleId);
            return this.buildFilteredTree(allMenus, userPerms, {
                enabledModules,
                validCredentials,
                businessTypeCode: query.businessTypeCode,
                terminology,
            });
        }
        catch (error) {
            this.logger.error(`GetMyMenuHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async loadRolePermissions(roleId) {
        const rps = await this.prisma.identity.rolePermission.findMany({
            where: { roleId },
            include: { permission: { select: { module: true, action: true } } },
        });
        return new Set(rps.map((rp) => `${rp.permission.module}:${rp.permission.action}`));
    }
    async loadEnabledModules(tenantId) {
        if (!tenantId)
            return new Set();
        const modules = await this.prisma.platform.tenantModule.findMany({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
            include: { module: { select: { code: true } } },
        });
        return new Set(modules.map((m) => m.module.code));
    }
    async loadValidCredentials(tenantId) {
        if (!tenantId)
            return new Set();
        const modules = await this.prisma.platform.tenantModule.findMany({
            where: { tenantId, credentialsStatus: 'VALID' },
            include: { module: { select: { code: true } } },
        });
        return new Set(modules.map((m) => m.module.code));
    }
    async loadTerminology(tenantId) {
        if (!tenantId)
            return {};
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            return {};
        const businessType = tenant.businessTypeId
            ? await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id: tenant.businessTypeId } })
            : null;
        const result = businessType
            ? { ...businessType.terminologyMap }
            : {};
        const overrides = await this.prisma.identity.terminologyOverride.findMany({
            where: { tenantId, isActive: true },
        });
        for (const ov of overrides) {
            result[ov.termKey] = ov.customLabel;
        }
        return result;
    }
    buildTree(menus) {
        const map = new Map();
        const roots = [];
        for (const m of menus) {
            map.set(m.id, this.toTreeItem(m));
        }
        for (const m of menus) {
            const node = map.get(m.id);
            if (m.parentId && map.has(m.parentId)) {
                map.get(m.parentId).children.push(node);
            }
            else if (!m.parentId) {
                roots.push(node);
            }
        }
        return roots;
    }
    buildFilteredTree(menus, perms, ctx) {
        const map = new Map();
        for (const m of menus) {
            map.set(m.id, { ...m, childRows: [] });
        }
        for (const m of menus) {
            if (m.parentId && map.has(m.parentId)) {
                map.get(m.parentId).childRows.push(m);
            }
        }
        const roots = menus.filter((m) => !m.parentId);
        return this.filterLevel(roots, map, perms, ctx);
    }
    filterLevel(items, map, perms, ctx) {
        const visible = [];
        for (const item of items) {
            const entry = map.get(item.id);
            if (item.menuType === 'DIVIDER') {
                if (visible.length > 0 && visible[visible.length - 1].menuType !== 'DIVIDER') {
                    visible.push(this.toTreeItem(item, ctx?.terminology));
                }
                continue;
            }
            if (item.menuType === 'TITLE') {
                visible.push(this.toTreeItem(item, ctx?.terminology));
                continue;
            }
            if (item.menuType === 'GROUP') {
                if (item.isAdminOnly)
                    continue;
                if (!this.checkBusinessType(item, ctx?.businessTypeCode))
                    continue;
                const filteredChildren = this.filterLevel(entry.childRows, map, perms, ctx);
                if (filteredChildren.length > 0) {
                    const node = this.toTreeItem(item, ctx?.terminology);
                    node.children = filteredChildren;
                    visible.push(node);
                }
                continue;
            }
            if (item.isAdminOnly)
                continue;
            if (this.isVisible5Check(item, perms, ctx)) {
                const node = this.toTreeItem(item, ctx?.terminology);
                if (entry.childRows.length > 0) {
                    node.children = this.filterLevel(entry.childRows, map, perms, ctx);
                }
                visible.push(node);
            }
        }
        while (visible.length > 0 && visible[visible.length - 1].menuType === 'DIVIDER') {
            visible.pop();
        }
        return visible;
    }
    isVisible5Check(menu, perms, ctx) {
        if (menu.autoEnableWithModule && ctx?.enabledModules) {
            if (!ctx.enabledModules.has(menu.autoEnableWithModule))
                return false;
        }
        if (!this.checkBusinessType(menu, ctx?.businessTypeCode))
            return false;
        if (menu.requiresCredential && menu.credentialKey && ctx?.validCredentials) {
            if (!ctx.validCredentials.has(menu.credentialKey))
                return false;
        }
        if (menu.permissionModule && menu.permissionAction) {
            if (!perms.has(`${menu.permissionModule}:${menu.permissionAction}`))
                return false;
        }
        return true;
    }
    checkBusinessType(menu, businessTypeCode) {
        if (!menu.businessTypeApplicability)
            return true;
        const applicability = Array.isArray(menu.businessTypeApplicability)
            ? menu.businessTypeApplicability
            : JSON.parse(String(menu.businessTypeApplicability));
        if (applicability.includes('ALL'))
            return true;
        if (!businessTypeCode)
            return true;
        return applicability.includes(businessTypeCode);
    }
    toTreeItem(m, terminology) {
        let name = m.name;
        if (m.terminologyKey && terminology && terminology[m.terminologyKey]) {
            name = terminology[m.terminologyKey];
        }
        return {
            id: m.id, name, code: m.code, icon: m.icon, route: m.route,
            menuType: m.menuType, badgeColor: m.badgeColor, badgeText: m.badgeText,
            openInNewTab: m.openInNewTab, children: [],
        };
    }
};
exports.GetMyMenuHandler = GetMyMenuHandler;
exports.GetMyMenuHandler = GetMyMenuHandler = GetMyMenuHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_my_menu_query_1.GetMyMenuQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], GetMyMenuHandler);
//# sourceMappingURL=get-my-menu.handler.js.map