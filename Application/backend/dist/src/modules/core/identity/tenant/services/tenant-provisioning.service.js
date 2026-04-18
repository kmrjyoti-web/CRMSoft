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
var TenantProvisioningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantProvisioningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const tenant_context_service_1 = require("../infrastructure/tenant-context.service");
const menu_seed_data_1 = require("../../menus/presentation/menu-seed-data");
let TenantProvisioningService = TenantProvisioningService_1 = class TenantProvisioningService {
    constructor(prisma, tenantContext) {
        this.prisma = prisma;
        this.tenantContext = tenantContext;
        this.logger = new common_1.Logger(TenantProvisioningService_1.name);
    }
    async provision(data) {
        return this.prisma.identity.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    status: 'TRIAL',
                    onboardingStep: 'CREATED',
                },
            });
            const tenantId = tenant.id;
            const roles = await Promise.all([
                tx.role.create({ data: { tenantId, name: 'ADMIN', displayName: 'Admin', description: 'Tenant admin', isSystem: true } }),
                tx.role.create({ data: { tenantId, name: 'MANAGER', displayName: 'Manager', description: 'Team manager' } }),
                tx.role.create({ data: { tenantId, name: 'SALES_EXECUTIVE', displayName: 'Sales Executive', description: 'Field sales' } }),
                tx.role.create({ data: { tenantId, name: 'MARKETING_STAFF', displayName: 'Marketing Staff', description: 'Marketing team' } }),
                tx.role.create({ data: { tenantId, name: 'SUPPORT_AGENT', displayName: 'Support Agent', description: 'Customer support' } }),
                tx.role.create({ data: { tenantId, name: 'ACCOUNT_MANAGER', displayName: 'Account Manager', description: 'Post-sales' } }),
                tx.role.create({ data: { tenantId, name: 'CUSTOMER', displayName: 'Customer', description: 'Customer portal' } }),
                tx.role.create({ data: { tenantId, name: 'REFERRAL_PARTNER', displayName: 'Referral Partner', description: 'Partner portal' } }),
            ]);
            const adminRole = roles.find(r => r.name === 'ADMIN');
            const hashedPassword = data.adminPassword;
            const adminUser = await tx.user.create({
                data: {
                    tenantId,
                    email: data.adminEmail,
                    password: hashedPassword,
                    firstName: data.adminFirstName,
                    lastName: data.adminLastName,
                    roleId: adminRole.id,
                    userType: 'ADMIN',
                },
            });
            const permissions = await tx.permission.findMany();
            await tx.rolePermission.createMany({
                data: permissions.map(p => ({
                    tenantId,
                    roleId: adminRole.id,
                    permissionId: p.id,
                })),
            });
            const defaultLookups = [
                { category: 'INDUSTRY', displayName: 'Industry', isSystem: true, tenantId },
                { category: 'LEAD_SOURCE', displayName: 'Lead Source', isSystem: true, tenantId },
                { category: 'PRODUCT_CATEGORY', displayName: 'Product Category', isSystem: true, tenantId },
            ];
            for (const lookup of defaultLookups) {
                await tx.masterLookup.create({ data: lookup });
            }
            const subscription = await tx.subscription.create({
                data: {
                    tenantId,
                    planId: data.planId,
                    status: 'TRIALING',
                    currentPeriodStart: new Date(),
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
            });
            await tx.tenantUsage.create({
                data: {
                    tenantId,
                    usersCount: 1,
                    lastCalculated: new Date(),
                },
            });
            await this.seedMenus(tx, tenantId);
            this.logger.log(`Tenant provisioned: ${tenant.id} (${data.name})`);
            return { tenant, adminUser, subscription };
        }, { timeout: 30000 });
    }
    async seedMenus(tx, tenantId) {
        let sortOrder = 0;
        for (const item of menu_seed_data_1.MENU_SEED_DATA) {
            const parent = await tx.menu.create({
                data: {
                    tenantId,
                    name: item.name,
                    code: item.code,
                    icon: item.icon ?? null,
                    route: item.route ?? null,
                    menuType: item.menuType ?? 'ITEM',
                    permissionModule: item.permissionModule ?? null,
                    permissionAction: item.permissionAction ?? null,
                    badgeText: item.badgeText ?? null,
                    badgeColor: item.badgeColor ?? null,
                    sortOrder: sortOrder++,
                },
            });
            if (item.children) {
                let childOrder = 0;
                for (const child of item.children) {
                    await tx.menu.create({
                        data: {
                            tenantId,
                            parentId: parent.id,
                            name: child.name,
                            code: child.code,
                            icon: child.icon ?? null,
                            route: child.route ?? null,
                            menuType: child.menuType ?? 'ITEM',
                            permissionModule: child.permissionModule ?? null,
                            permissionAction: child.permissionAction ?? null,
                            badgeText: child.badgeText ?? null,
                            badgeColor: child.badgeColor ?? null,
                            sortOrder: childOrder++,
                        },
                    });
                }
            }
        }
    }
};
exports.TenantProvisioningService = TenantProvisioningService;
exports.TenantProvisioningService = TenantProvisioningService = TenantProvisioningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_context_service_1.TenantContextService])
], TenantProvisioningService);
//# sourceMappingURL=tenant-provisioning.service.js.map