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
var MenuManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuManagementService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const menu_management_errors_1 = require("./menu-management.errors");
let MenuManagementService = MenuManagementService_1 = class MenuManagementService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(MenuManagementService_1.name);
    }
    async getMenuTree() {
        try {
            const items = await this.db.globalMenuConfig.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
            });
            return this.buildTree(items);
        }
        catch (error) {
            this.logger.error('Failed to get menu tree', error.stack);
            throw error;
        }
    }
    async getMenuFlat() {
        try {
            return await this.db.globalMenuConfig.findMany({
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to get flat menu', error.stack);
            throw error;
        }
    }
    async createMenuItem(dto) {
        try {
            const existing = await this.db.globalMenuConfig.findUnique({
                where: { menuKey: dto.menuKey },
            });
            if (existing) {
                const err = menu_management_errors_1.MENU_MANAGEMENT_ERRORS.DUPLICATE_KEY;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            if (dto.parentKey) {
                const parent = await this.db.globalMenuConfig.findUnique({
                    where: { menuKey: dto.parentKey },
                });
                if (!parent) {
                    const err = menu_management_errors_1.MENU_MANAGEMENT_ERRORS.PARENT_NOT_FOUND;
                    throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
                }
            }
            if (dto.sortOrder === undefined) {
                const siblingCount = await this.db.globalMenuConfig.count({
                    where: { parentKey: dto.parentKey || null },
                });
                dto.sortOrder = siblingCount + 1;
            }
            return await this.db.globalMenuConfig.create({
                data: {
                    menuKey: dto.menuKey,
                    label: dto.label,
                    labelHi: dto.labelHi,
                    icon: dto.icon || null,
                    parentKey: dto.parentKey || null,
                    route: dto.route || null,
                    moduleCode: dto.moduleCode || null,
                    verticalType: dto.verticalType || null,
                    sortOrder: dto.sortOrder,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to create menu item', error.stack);
            throw error;
        }
    }
    async updateMenuItem(id, dto) {
        try {
            const item = await this.db.globalMenuConfig.findUnique({ where: { id } });
            if (!item) {
                const err = menu_management_errors_1.MENU_MANAGEMENT_ERRORS.MENU_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            if (dto.parentKey !== undefined && dto.parentKey === item.menuKey) {
                const err = menu_management_errors_1.MENU_MANAGEMENT_ERRORS.CIRCULAR_PARENT;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return await this.db.globalMenuConfig.update({
                where: { id },
                data: {
                    ...(dto.label !== undefined && { label: dto.label }),
                    ...(dto.labelHi !== undefined && { labelHi: dto.labelHi }),
                    ...(dto.icon !== undefined && { icon: dto.icon }),
                    ...(dto.parentKey !== undefined && { parentKey: dto.parentKey }),
                    ...(dto.route !== undefined && { route: dto.route }),
                    ...(dto.moduleCode !== undefined && { moduleCode: dto.moduleCode }),
                    ...(dto.verticalType !== undefined && { verticalType: dto.verticalType }),
                    ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to update menu item: ${id}`, error.stack);
            throw error;
        }
    }
    async deleteMenuItem(id) {
        try {
            return await this.db.globalMenuConfig.update({
                where: { id },
                data: { isActive: false, updatedAt: new Date() },
            });
        }
        catch (error) {
            this.logger.error(`Failed to delete menu item: ${id}`, error.stack);
            throw error;
        }
    }
    async reorderMenuItems(items) {
        try {
            await this.db.$transaction(items.map((item) => this.db.globalMenuConfig.update({
                where: { id: item.id },
                data: {
                    sortOrder: item.sortOrder,
                    ...(item.parentKey !== undefined && { parentKey: item.parentKey }),
                    updatedAt: new Date(),
                },
            })));
            return { success: true, updated: items.length };
        }
        catch (error) {
            this.logger.error('Failed to reorder menu items', error.stack);
            throw error;
        }
    }
    async getMenuWithBrandOverrides(brandId) {
        try {
            const items = await this.db.globalMenuConfig.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
            });
            const overrides = await this.db.brandMenuOverride.findMany({
                where: { brandId },
            });
            const whitelistedModules = await this.db.brandModuleWhitelist.findMany({
                where: { brandId },
            });
            const whitelistedCodes = new Set(whitelistedModules.map((m) => m.moduleCode));
            const overrideMap = new Map(overrides.map((o) => [o.menuKey, o]));
            const filteredItems = items
                .filter((item) => {
                const override = overrideMap.get(item.menuKey);
                if (override?.isHidden)
                    return false;
                if (item.moduleCode && whitelistedCodes.size > 0 && !whitelistedCodes.has(item.moduleCode)) {
                    return false;
                }
                return true;
            })
                .map((item) => {
                const override = overrideMap.get(item.menuKey);
                if (override) {
                    return {
                        ...item,
                        label: override.customLabel || item.label,
                        icon: override.customIcon || item.icon,
                        sortOrder: override.sortOrder ?? item.sortOrder,
                    };
                }
                return item;
            });
            return this.buildTree(filteredItems);
        }
        catch (error) {
            this.logger.error(`Failed to get menu with brand overrides: ${brandId}`, error.stack);
            throw error;
        }
    }
    async setBrandOverride(brandId, dto) {
        try {
            const menuExists = await this.db.globalMenuConfig.findUnique({
                where: { menuKey: dto.menuKey },
            });
            if (!menuExists) {
                const err = menu_management_errors_1.MENU_MANAGEMENT_ERRORS.MENU_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return await this.db.brandMenuOverride.upsert({
                where: { brandId_menuKey: { brandId, menuKey: dto.menuKey } },
                update: {
                    customLabel: dto.customLabel,
                    customIcon: dto.customIcon,
                    isHidden: dto.isHidden ?? false,
                    sortOrder: dto.sortOrder,
                },
                create: {
                    brandId,
                    menuKey: dto.menuKey,
                    customLabel: dto.customLabel,
                    customIcon: dto.customIcon,
                    isHidden: dto.isHidden ?? false,
                    sortOrder: dto.sortOrder,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to set brand override: ${brandId}`, error.stack);
            throw error;
        }
    }
    async updateBrandOverride(id, data) {
        try {
            return await this.db.brandMenuOverride.update({
                where: { id },
                data: {
                    ...(data.customLabel !== undefined && { customLabel: data.customLabel }),
                    ...(data.customIcon !== undefined && { customIcon: data.customIcon }),
                    ...(data.isHidden !== undefined && { isHidden: data.isHidden }),
                    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update brand override: ${id}`, error.stack);
            throw error;
        }
    }
    async removeBrandOverride(id) {
        try {
            return await this.db.brandMenuOverride.delete({ where: { id } });
        }
        catch (error) {
            this.logger.error(`Failed to remove brand override: ${id}`, error.stack);
            throw error;
        }
    }
    async getBrandOverrides(brandId) {
        try {
            return await this.db.brandMenuOverride.findMany({
                where: { brandId },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get brand overrides: ${brandId}`, error.stack);
            throw error;
        }
    }
    async previewMenu(brandId, role) {
        try {
            const menu = await this.getMenuWithBrandOverrides(brandId);
            if (role) {
                this.logger.log(`Preview requested for role=${role} — role filtering not yet implemented`);
            }
            return menu;
        }
        catch (error) {
            this.logger.error(`Failed to preview menu: ${brandId}`, error.stack);
            throw error;
        }
    }
    buildTree(items) {
        const map = new Map();
        const roots = [];
        for (const item of items) {
            map.set(item.menuKey, {
                id: item.id,
                menuKey: item.menuKey,
                label: item.label,
                labelHi: item.labelHi,
                icon: item.icon || undefined,
                route: item.route || undefined,
                moduleCode: item.moduleCode || undefined,
                verticalType: item.verticalType || undefined,
                sortOrder: item.sortOrder,
                isActive: item.isActive,
                children: [],
            });
        }
        for (const item of items) {
            const node = map.get(item.menuKey);
            if (item.parentKey && map.has(item.parentKey)) {
                map.get(item.parentKey).children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        const sortChildren = (nodes) => {
            nodes.sort((a, b) => a.sortOrder - b.sortOrder);
            for (const node of nodes) {
                sortChildren(node.children);
            }
        };
        sortChildren(roots);
        return roots;
    }
};
exports.MenuManagementService = MenuManagementService;
exports.MenuManagementService = MenuManagementService = MenuManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], MenuManagementService);
//# sourceMappingURL=menu-management.service.js.map