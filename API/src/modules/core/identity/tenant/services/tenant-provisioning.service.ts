// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TenantContextService } from '../infrastructure/tenant-context.service';
import { MENU_SEED_DATA } from '../../menus/presentation/menu-seed-data';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async provision(data: {
    name: string;
    slug: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    planId: string;
  }) {
    return this.prisma.identity.$transaction(async (tx: any) => {
      // 1. Create Tenant (global model — no tenantId needed)
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          status: 'TRIAL',
          onboardingStep: 'CREATED',
        },
      });

      const tenantId = tenant.id;

      // 2. Create default roles
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

      const adminRole = roles.find(r => r.name === 'ADMIN')!;

      // 3. Create admin user with tenantId explicitly (bypassing middleware since we're in transaction)
      const hashedPassword = data.adminPassword; // caller should hash before passing
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

      // 4. Assign all permissions to admin role
      const permissions = await tx.permission.findMany();
      await tx.rolePermission.createMany({
        data: permissions.map(p => ({
          tenantId,
          roleId: adminRole.id,
          permissionId: p.id,
        })),
      });

      // 5. Create default lookups
      const defaultLookups = [
        { category: 'INDUSTRY', displayName: 'Industry', isSystem: true, tenantId },
        { category: 'LEAD_SOURCE', displayName: 'Lead Source', isSystem: true, tenantId },
        { category: 'PRODUCT_CATEGORY', displayName: 'Product Category', isSystem: true, tenantId },
      ];
      for (const lookup of defaultLookups) {
        await tx.masterLookup.create({ data: lookup });
      }

      // 6. Create subscription (trial)
      const subscription = await tx.subscription.create({
        data: {
          tenantId,
          planId: data.planId,
          status: 'TRIALING',
          currentPeriodStart: new Date(),
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });

      // 7. Create usage record
      await tx.tenantUsage.create({
        data: {
          tenantId,
          usersCount: 1,
          lastCalculated: new Date(),
        },
      });

      // 8. Create default menu items for tenant
      await this.seedMenus(tx, tenantId);

      this.logger.log(`Tenant provisioned: ${tenant.id} (${data.name})`);

      return { tenant, adminUser, subscription };
    }, { timeout: 30000 });
  }

  /** Seed default menu items for a new tenant. */
  private async seedMenus(tx: any, tenantId: string) {
    let sortOrder = 0;
    for (const item of MENU_SEED_DATA) {
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
}
