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
var PlatformBootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const menu_seed_data_1 = require("../../modules/core/identity/menus/presentation/menu-seed-data");
const business_type_seed_data_1 = require("../../modules/softwarevendor/business-type/services/business-type-seed-data");
const cross_service_decorator_1 = require("../../common/decorators/cross-service.decorator");
let PlatformBootstrapService = PlatformBootstrapService_1 = class PlatformBootstrapService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(PlatformBootstrapService_1.name);
    }
    async onModuleInit() {
        await this.ensureSuperAdmin();
        await this.ensureDemoVendor();
        this.runBackgroundTasks();
    }
    runBackgroundTasks() {
        void Promise.all([
            this.ensureMissingPermissions().catch((e) => this.logger.error('ensureMissingPermissions failed', e)),
            this.ensureTenantMenus().catch((e) => this.logger.error('ensureTenantMenus failed', e)),
            this.ensureBusinessTypes().catch((e) => this.logger.error('ensureBusinessTypes failed', e)),
        ]).then(() => this.logger.log('Background bootstrap tasks completed'));
    }
    async ensureSuperAdmin() {
        const existing = await this.prisma.identity.superAdmin.findFirst();
        if (existing) {
            this.logger.log('Platform Admin already exists — skipping bootstrap');
            return;
        }
        const email = this.config.get('PLATFORM_ADMIN_EMAIL') ?? 'platform@crm.com';
        const password = this.config.get('PLATFORM_ADMIN_DEFAULT_PASSWORD');
        if (!password) {
            throw new Error('PLATFORM_ADMIN_DEFAULT_PASSWORD must be set in environment before first boot');
        }
        const hashed = await bcrypt.hash(password, 12);
        await this.prisma.identity.superAdmin.create({
            data: {
                email,
                password: hashed,
                firstName: 'Platform',
                lastName: 'Admin',
            },
        });
        this.logger.warn('================================================');
        this.logger.warn('  PLATFORM ADMIN AUTO-PROVISIONED');
        this.logger.warn(`  Email: ${email}`);
        this.logger.warn('  Password set from PLATFORM_ADMIN_DEFAULT_PASSWORD env var');
        this.logger.warn('  Change this password after first login!');
        this.logger.warn('================================================');
    }
    async ensureDemoVendor() {
        const existing = await this.prisma.platform.marketplaceVendor.findFirst();
        if (existing) {
            if (!existing.password) {
                const password = this.config.get('VENDOR_DEFAULT_PASSWORD');
                if (!password) {
                    this.logger.error('VENDOR_DEFAULT_PASSWORD env var not set — skipping vendor password update');
                    return;
                }
                const hashed = await bcrypt.hash(password, 12);
                await this.prisma.platform.marketplaceVendor.update({
                    where: { id: existing.id },
                    data: { password: hashed, status: 'APPROVED' },
                });
                this.logger.warn('================================================');
                this.logger.warn('  VENDOR PASSWORD SET');
                this.logger.warn(`  Email: ${existing.contactEmail}`);
                this.logger.warn('  Password set from VENDOR_DEFAULT_PASSWORD env var');
                this.logger.warn('================================================');
            }
            return;
        }
        const email = this.config.get('VENDOR_DEFAULT_EMAIL') ?? 'vendor@demo.com';
        const password = this.config.get('VENDOR_DEFAULT_PASSWORD');
        if (!password) {
            throw new Error('VENDOR_DEFAULT_PASSWORD must be set in environment before first boot');
        }
        const hashed = await bcrypt.hash(password, 12);
        await this.prisma.platform.marketplaceVendor.create({
            data: {
                companyName: 'Demo Vendor Co.',
                contactName: 'Demo Vendor',
                contactEmail: email,
                password: hashed,
                status: 'APPROVED',
            },
        });
        this.logger.warn('================================================');
        this.logger.warn('  DEMO VENDOR AUTO-PROVISIONED');
        this.logger.warn(`  Email: ${email}`);
        this.logger.warn('  Password set from VENDOR_DEFAULT_PASSWORD env var');
        this.logger.warn('  Change this password after first login!');
        this.logger.warn('================================================');
    }
    async ensureMissingPermissions() {
        const missingModules = ['audit', 'settings', 'wallet', 'raw_contacts', 'inventory'];
        const actions = ['create', 'read', 'update', 'delete', 'export'];
        const created = [];
        for (const mod of missingModules) {
            for (const action of actions) {
                const perm = await this.prisma.identity.permission.upsert({
                    where: { module_action: { module: mod, action } },
                    update: {},
                    create: { module: mod, action, description: `${action} ${mod}` },
                });
                const adminRoles = await this.prisma.identity.role.findMany({
                    where: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                    select: { id: true, tenantId: true },
                });
                for (const role of adminRoles) {
                    if (!role.tenantId)
                        continue;
                    await this.prisma.identity.rolePermission.upsert({
                        where: {
                            tenantId_roleId_permissionId: {
                                tenantId: role.tenantId,
                                roleId: role.id,
                                permissionId: perm.id,
                            },
                        },
                        update: {},
                        create: { tenantId: role.tenantId, roleId: role.id, permissionId: perm.id },
                    });
                }
                created.push(`${mod}:${action}`);
            }
        }
        this.logger.log(`Permissions ensured: ${missingModules.join(', ')} (${created.length} entries)`);
    }
    async ensureTenantMenus() {
        const orphanedCount = await this.prisma.identity.menu.count({ where: { tenantId: '' } });
        if (orphanedCount > 0) {
            await this.prisma.identity.menu.deleteMany({ where: { tenantId: '', parentId: { not: null } } });
            await this.prisma.identity.menu.deleteMany({ where: { tenantId: '' } });
            this.logger.warn(`Cleaned up ${orphanedCount} orphaned menus (empty tenantId)`);
        }
        const expectedCount = this.countExpectedMenus();
        const tenants = await this.prisma.identity.tenant.findMany({
            select: { id: true, name: true, slug: true },
        });
        for (const tenant of tenants) {
            await this.deduplicateMenus(tenant.id);
            const menuCount = await this.prisma.identity.menu.count({
                where: { tenantId: tenant.id },
            });
            const staleCount = await this.prisma.identity.menu.count({
                where: { tenantId: tenant.id, permissionAction: 'view' },
            });
            const seedCodes = menu_seed_data_1.MENU_SEED_DATA.map((m) => m.code);
            const existingCodes = await this.prisma.identity.menu.findMany({
                where: { tenantId: tenant.id, parentId: null, code: { in: seedCodes } },
                select: { code: true },
            });
            const existingCodeSet = new Set(existingCodes.map((m) => m.code));
            const missingCodes = seedCodes.filter((c) => !existingCodeSet.has(c));
            if (menuCount < expectedCount || staleCount > 0 || missingCodes.length > 0) {
                const reason = missingCodes.length > 0
                    ? `missing menus: ${missingCodes.join(', ')}`
                    : staleCount > 0
                        ? `${staleCount} menus with stale permissionAction='view'`
                        : `${menuCount}/${expectedCount} menus`;
                this.logger.warn(`Tenant "${tenant.name}" needs repair (${reason}) — re-seeding...`);
                await this.repairMenusForTenant(tenant.id);
                const newCount = await this.prisma.identity.menu.count({
                    where: { tenantId: tenant.id },
                });
                this.logger.log(`Tenant "${tenant.name}" menus repaired: ${newCount} items`);
            }
        }
    }
    async deduplicateMenus(tenantId) {
        const allMenus = await this.prisma.identity.menu.findMany({
            where: { tenantId },
            select: { id: true, code: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        const seen = new Set();
        const duplicateIds = [];
        for (const menu of allMenus) {
            if (seen.has(menu.code)) {
                duplicateIds.push(menu.id);
            }
            else {
                seen.add(menu.code);
            }
        }
        if (duplicateIds.length > 0) {
            await this.prisma.identity.menu.deleteMany({
                where: { parentId: { in: duplicateIds } },
            });
            await this.prisma.identity.menu.deleteMany({
                where: { id: { in: duplicateIds } },
            });
            this.logger.warn(`Tenant ${tenantId}: removed ${duplicateIds.length} duplicate menus`);
        }
    }
    countExpectedMenus() {
        let count = 0;
        for (const item of menu_seed_data_1.MENU_SEED_DATA) {
            count++;
            if (item.children) {
                count += item.children.length;
                for (const child of item.children) {
                    if (child.children)
                        count += child.children.length;
                }
            }
        }
        return count;
    }
    async ensureBusinessTypes() {
        const count = await this.prisma.platform.businessTypeRegistry.count();
        if (count >= business_type_seed_data_1.BUSINESS_TYPE_SEED_DATA.length) {
            this.logger.log(`Business types already seeded (${count} entries)`);
            return;
        }
        for (let i = 0; i < business_type_seed_data_1.BUSINESS_TYPE_SEED_DATA.length; i++) {
            const bt = business_type_seed_data_1.BUSINESS_TYPE_SEED_DATA[i];
            await this.prisma.platform.businessTypeRegistry.upsert({
                where: { typeCode: bt.typeCode },
                update: {
                    typeName: bt.typeName,
                    industryCategory: bt.industryCategory,
                    description: bt.description,
                    icon: bt.icon,
                    colorTheme: bt.colorTheme,
                    terminologyMap: bt.terminologyMap,
                    defaultModules: bt.defaultModules,
                    recommendedModules: bt.recommendedModules,
                    excludedModules: bt.excludedModules,
                    dashboardWidgets: bt.dashboardWidgets,
                    workflowTemplates: bt.workflowTemplates,
                    extraFields: bt.extraFields ?? {},
                    isDefault: bt.isDefault ?? false,
                },
                create: {
                    typeCode: bt.typeCode,
                    typeName: bt.typeName,
                    industryCategory: bt.industryCategory,
                    description: bt.description,
                    icon: bt.icon,
                    colorTheme: bt.colorTheme,
                    terminologyMap: bt.terminologyMap,
                    defaultModules: bt.defaultModules,
                    recommendedModules: bt.recommendedModules,
                    excludedModules: bt.excludedModules,
                    dashboardWidgets: bt.dashboardWidgets,
                    workflowTemplates: bt.workflowTemplates,
                    extraFields: bt.extraFields ?? {},
                    isDefault: bt.isDefault ?? false,
                    sortOrder: i,
                },
            });
        }
        this.logger.log(`Business types seeded: ${business_type_seed_data_1.BUSINESS_TYPE_SEED_DATA.length} industries`);
    }
    async repairMenusForTenant(tenantId) {
        const level2 = await this.prisma.identity.menu.findMany({
            where: { tenantId, parentId: { not: null } },
            select: { id: true },
        });
        const level2Ids = level2.map((m) => m.id);
        if (level2Ids.length > 0) {
            await this.prisma.identity.menu.deleteMany({
                where: { tenantId, parentId: { in: level2Ids } },
            });
        }
        await this.prisma.identity.menu.deleteMany({
            where: { tenantId, parentId: { not: null } },
        });
        await this.prisma.identity.menu.deleteMany({ where: { tenantId } });
        let sortOrder = 0;
        for (const item of menu_seed_data_1.MENU_SEED_DATA) {
            const parent = await this.prisma.identity.menu.create({
                data: {
                    tenantId,
                    name: item.name,
                    code: item.code,
                    icon: item.icon ?? null,
                    route: item.route ?? null,
                    menuType: item.menuType ?? 'ITEM',
                    permissionModule: item.permissionModule ?? null,
                    permissionAction: item.permissionAction ?? (item.permissionModule ? 'read' : null),
                    badgeText: item.badgeText ?? null,
                    badgeColor: item.badgeColor ?? null,
                    isAdminOnly: item.isAdminOnly ?? false,
                    sortOrder: sortOrder++,
                },
            });
            if (item.children) {
                let childOrder = 0;
                for (const child of item.children) {
                    const childMenu = await this.prisma.identity.menu.create({
                        data: {
                            tenantId,
                            parentId: parent.id,
                            name: child.name,
                            code: child.code,
                            icon: child.icon ?? null,
                            route: child.route ?? null,
                            menuType: child.menuType ?? 'ITEM',
                            permissionModule: child.permissionModule ?? null,
                            permissionAction: child.permissionAction ?? (child.permissionModule ? 'read' : null),
                            badgeText: child.badgeText ?? null,
                            badgeColor: child.badgeColor ?? null,
                            isAdminOnly: child.isAdminOnly ?? false,
                            sortOrder: childOrder++,
                        },
                    });
                    if (child.children) {
                        let grandOrder = 0;
                        for (const grandchild of child.children) {
                            await this.prisma.identity.menu.create({
                                data: {
                                    tenantId,
                                    parentId: childMenu.id,
                                    name: grandchild.name,
                                    code: grandchild.code,
                                    icon: grandchild.icon ?? null,
                                    route: grandchild.route ?? null,
                                    menuType: grandchild.menuType ?? 'ITEM',
                                    permissionModule: grandchild.permissionModule ?? null,
                                    permissionAction: grandchild.permissionAction ?? (grandchild.permissionModule ? 'read' : null),
                                    badgeText: grandchild.badgeText ?? null,
                                    badgeColor: grandchild.badgeColor ?? null,
                                    isAdminOnly: grandchild.isAdminOnly ?? false,
                                    sortOrder: grandOrder++,
                                },
                            });
                        }
                    }
                }
            }
        }
    }
};
exports.PlatformBootstrapService = PlatformBootstrapService;
exports.PlatformBootstrapService = PlatformBootstrapService = PlatformBootstrapService_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('vendor', 'Imports BUSINESS_TYPE_SEED_DATA from softwarevendor to seed platform business types on first boot — extract to shared constants package when splitting services'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PlatformBootstrapService);
//# sourceMappingURL=platform-bootstrap.service.js.map